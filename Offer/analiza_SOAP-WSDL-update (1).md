# Analysis — SOAP WSDL upgrade `2020.1` → `2024.1` (commit `a8aa41a5e`)

This document explains, in plain English, what the WSDL upgrade actually changes, whether it can fix the Akamai response-hang that has been losing order syncs, what the upgrade does *not* fix, and a side-effect to be aware of from the same commit. It also covers a recommended test plan and known remaining risks.

## Table of Contents
1. [Short answer up front](#short-answer-up-front)
2. [Background concepts](#background-concepts)
3. [What actually changed in commit `a8aa41a5e`](#what-actually-changed-in-commit-a8aa41a5e)
4. [Where the upgrade *could* help indirectly](#where-the-upgrade-could-help-indirectly)
5. [What the upgrade definitely doesn't fix](#what-the-upgrade-definitely-doesnt-fix)
6. [One side-effect to be aware of from the same commit](#one-side-effect-to-be-aware-of-from-the-same-commit)
7. [Test plan](#test-plan)
8. [Empirical confirmation (2026-05-14)](#empirical-confirmation-2026-05-14)
9. [Known remaining issues after this change](#known-remaining-issues-after-this-change)
10. [Sources](#sources)

---

## Short answer up front

**Will upgrading the NetSuite SuiteTalk SOAP client from `webservices_2020_01` to `webservices_2024_01` fix the Akamai response-hang that causes orders to get stuck?**

**No — empirically confirmed on 2026-05-14.** See [Empirical confirmation (2026-05-14)](#empirical-confirmation-2026-05-14) below. The WSDL upgrade is still the right step to take — it is hygiene, not the cure.

The hang is a transport-layer problem: NetSuite creates the order on its side, but the response bytes never travel back through Akamai (NetSuite's CDN) to our process, so `Service.add()` blocks forever and the scheduler kills the process at the 3-minute mark. Akamai sits in front of the **host** (`*.suitetalk.api.netsuite.com`), and the WSDL version only changes the **URL path** under that host. Same host means same Akamai property means same CDN behavior. Changing the menu version does not change the front-door security guard.

What actually protects against this failure mode is the recovery code in branch `BULNS-13132-FixOrderSync-cp` (Changes 1–4 in [sync-order-issue.md](sync-order-issue.md)): the duplicate-check + nonce-refresh + stale-processing threshold + recovery path. **That branch is the actual hotfix; the WSDL bump alone changes nothing user-visible.**

---

## Background concepts

A few terms used everywhere below:

- **SOAP** — an older style of API where messages are sent as XML over HTTP. NetSuite calls theirs "SuiteTalk SOAP".
- **WSDL** — "Web Services Description Language". A contract file (XML) that describes everything a SOAP service offers: which operations exist (`add`, `update`, `search`...), what fields each record has, what types they are. Think of it as the **menu at a restaurant** — it lists what you can order. NetSuite publishes a new menu version each year (`2020.1`, `2021.1`, ... `2024.1`).
- **Web Reference / `Reference.cs`** — when you point Visual Studio at a WSDL, it auto-generates a giant C# file (`Reference.cs`) full of classes like `SalesOrder`, `Customer`, `RecordRef`. Our C# code uses those classes to talk to NetSuite. That is why the diff has ~240,000 lines changed — Visual Studio regenerated the whole file from the new menu.
- **URL anatomy** — a URL like `https://635786.suitetalk.api.netsuite.com/services/NetSuitePort_2024_1` has two important parts:
  - **Host** (`635786.suitetalk.api.netsuite.com`) — the building's address.
  - **Path** (`/services/NetSuitePort_2024_1`) — which room inside the building.
- **CDN / Akamai** — a Content Delivery Network is a global network of servers that sits **in front of** a company's real servers. NetSuite uses Akamai. When our code sends a request to NetSuite, it actually hits an Akamai edge server first. Akamai forwards it to NetSuite's real servers, gets the response, and passes it back. We never talk to NetSuite directly — we always go through Akamai. Akamai is matched on the **host**, not the path.
- **TBA** — Token-Based Authentication. The modern way to log in to NetSuite using a key/secret pair instead of a username/password. NetSuite has been pushing TBA for years and is deprecating email/password login.

---

## What actually changed in commit `a8aa41a5e`

Your colleague did the SOAP equivalent of "update the menu version we order from." Concretely, three things changed:

### Change A — The URL path the code sends requests to

In [App.config](../App.config) the endpoint string went from:

```
https://webservices.netsuite.com/services/NetSuitePort_2020_1
```

to:

```
https://webservices.netsuite.com/services/NetSuitePort_2024_1
```

Same host, only the last segment of the path changed (`2020_1` → `2024_1`). At runtime the host gets **replaced** by the value of `NetSuite:BaseURL:Override` (`https://635786.suitetalk.api.netsuite.com`) — see [NSClient.cs:147-161](../SuiteTalk/NSClient.cs#L147-L161) — but the path stays. So the real production URL is `https://635786.suitetalk.api.netsuite.com/services/NetSuitePort_2024_1`. Again: only the trailing path segment is different.

### Change B — The auto-generated C# classes

The folder `BullsM.Processor/Web References/com.netsuite.webservices_2020_01/` was deleted and replaced with `com.netsuite.webservices_2024_01/`. Inside, `Reference.cs` is regenerated to match the new WSDL — that is the 240,000-line diff. Visual Studio writes this file; nobody writes it by hand. New field types, new record types, removed deprecated stuff — all reflected in those generated C# classes.

### Change C — A handful of `using` lines

Files like [NSClient.cs:1-3](../SuiteTalk/NSClient.cs#L1-L3) had:

```csharp
using BullsM.Processor.com.netsuite.webservices_2020_01;
```

changed to:

```csharp
using BullsM.Processor.com.netsuite.webservices_2024_01;
```

That just tells those files which version of the auto-generated classes to use. No business logic was changed.

### What was *not* changed

- The actual server we talk to. Same `635786.suitetalk.api.netsuite.com` host. Same Akamai in front of it.
- The order-sync flow logic (`SyncCreate`, `CreateOrder`, retry loop) — unchanged.
- The transport — still SOAP/HTTP/TLS, still routed through Akamai.
- The 3-minute scheduler kill window — unchanged.

### Plain-English summary

Your colleague upgraded from "the 2020 version of NetSuite's API menu" to "the 2024 version." We are talking to the same restaurant, same front door (Akamai), we just switched to a newer menu.

---

## Where the upgrade *could* help indirectly

This is where we have to hedge, because nobody (including Oracle) publishes "we fixed Akamai hangs in version X." But three plausible mechanisms exist:

### Reason 1 — The 2020.1 endpoint is no longer maintained

NetSuite's policy: each WSDL version is supported for 3 years from release. So 2020.1 stopped getting **any** server-side updates around 2023.1. That means if NetSuite or Oracle fixed something on their servers — say, a bug where the response was not being flushed cleanly to Akamai, or a header that confused the CDN — that fix would land in current endpoints (2023.1, 2024.1, 2025.x) but **not** in 2020.1. By moving to 2024.1, we are now on a code path that **might** contain those silent fixes. There is no public release note that says "Akamai hang fixed in 2024.1," but if it was fixed at all, we are now on a path that could include the fix.

### Reason 2 — Different endpoint, possibly different server pool

Large web platforms often route different URL paths to different pools of application servers internally. So `/services/NetSuitePort_2020_1` might be served by old, lightly-maintained servers; `/services/NetSuitePort_2024_1` could be served by a newer pool with healthier config (better timeouts, more memory, fewer GC pauses). If the hang is caused by a slow or sick server in the old pool, moving to the new path might **coincidentally** avoid it. This is speculative — Oracle does not document their internal topology — but it is a real reason version upgrades sometimes make problems go away even when nothing in the API changed.

### Reason 3 — It unblocks the real fix

Per [sync-order-issue.md](sync-order-issue.md) §"Long-term direction", the durable fix is migrating to **SuiteTalk REST + OAuth 2.0**, because SOAP is being shut off entirely in 2028.2. We cannot go straight from 2020.1 to REST in one hop — too much code change at once. Going to 2024.1 first means:

1. We are on a supported endpoint we can keep using for ~1 more year.
2. The data shapes are closer to what REST uses today.
3. When REST migration starts, fewer things will break because the schema is current.

So even if 2024.1 does not fix the hang directly, it is a necessary step on the path to the version that **will**.

### Plain-English summary

Three "maybes" — newer endpoints might silently include server-side fixes, might be routed to healthier servers, and the upgrade is a stepping-stone to REST which is the actual long-term cure.

---

## What the upgrade definitely doesn't fix

The Akamai hang is described in [sync-order-issue.md](sync-order-issue.md) §"Akamai hang pattern":

1. The processor calls `Service.add(salesOrder)`.
2. The request goes: processor → Akamai → NetSuite.
3. NetSuite **does** create the sales order successfully.
4. NetSuite tries to send a response: NetSuite → Akamai → processor.
5. Akamai holds the response. The bytes never reach the processor.
6. The processor sits there waiting indefinitely.
7. Three minutes later, the scheduler's hard timer kills the whole process.

Why upgrading to 2024.1 does not directly fix this:

### Akamai is matched on the host, not the path

Akamai's job is to be the public-facing layer for anything reachable at `*.suitetalk.api.netsuite.com`. Whether we ask for `.../NetSuitePort_2020_1` or `.../NetSuitePort_2024_1`, our request lands at the **same Akamai edge server**, with the **same Akamai configuration** (called a "property" — see [Akamai's Understand the connections](https://techdocs.akamai.com/ion/docs/understand-the-connections)). Same timeout rules, same buffering rules, same retry rules. The path is just a string Akamai forwards to NetSuite's origin server — it does not change CDN behavior.

### The hang is a transport problem, not a schema problem

The bug is that bytes do not flow back to our process. That is a network/CDN issue. Changing which XML schema our client and server agree on does not affect whether the bytes physically arrive. Imagine the post office holding our mail — switching to nicer stationery does not make the mail get delivered.

### NetSuite's own documentation backs this up

[SOAP Web Services Reliability Considerations](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1540364662.html) describes the **exact** failure mode ("the server may process the request but the client receives no response") and lists their recommended fix: **retry logic with idempotency**. They do not say "use a newer WSDL" — they say "expect this to happen and handle it." That is why the team built the duplicate-check + nonce-refresh recovery (Changes 1–4 in [sync-order-issue.md](sync-order-issue.md)): those are the actual safety net. They detect the hang aftermath and recover.

### Plain-English summary

The hang happens at the front-door security guard (Akamai), not at the menu (WSDL). Changing menu versions does not change the guard's behavior. The real protection is the processor noticing afterward — "hey, NetSuite already has this order, I do not need to create it again" — which is what the existing recovery code does.

---

## One side-effect to be aware of from the same commit

Look at the diff in [NSClientModel.cs:264](../SuiteTalk/NSClientModel.cs#L264). The old code had a fallback path: if a caller said "I am not using TBA" (passed `useTba = false`), the code would build an old-style `Passport` object containing an email, password, role, and account number, and use that to authenticate. After the upgrade, that whole block is commented out and replaced with:

```csharp
throw new Exception("Cannot use regular passport. Have to use TBA.");
```

**In plain English:** the code used to support two ways of logging in (modern token-based, or old email-and-password fallback). Now the email-and-password fallback is removed — if anything in the codebase still asks for that path, the program will crash with a clear error message.

**Why this matters for testing:** if there is any code path still passing `useTba = false`, it will throw at runtime. A grep for `SetPreferences(..., false, ...)` found zero matches, meaning every caller in the current code already passes `useTba = true`. So in practice this throw should never fire. But:

- It is worth knowing about in case a future maintenance step (or a stale branch we merge later) re-introduces a `useTba = false` caller — it will fail immediately rather than silently using deprecated auth.
- If we have config-driven feature flags that toggle TBA, double-check none of them set this to `false` for any environment.

**Why your colleague did this:** NetSuite has been actively deprecating the email/password Passport. The 2024.1 WSDL likely does not even include the deprecated `Passport` type any more, or includes it with required fields that do not match the old code. Rather than half-fix the dead path, your colleague chose to fail loudly. Good call — fail-loud is much safer than silently authenticating with a method that is about to be turned off server-side.

### Plain-English summary

Email/password login to NetSuite is dead. The old code still had a "just in case" fallback for it; now that fallback is replaced with a loud crash. Nothing currently uses it, but be aware of the new error message in case it ever appears in logs.

---

## Test plan

The proposed test ("build, deploy, create order, click Sync to NetSuite, run the ETL") exercises `SyncCreate` only. That is the **minimum** but not enough to ship with confidence, because the 2024.1 WSDL touched ~240K lines of `Reference.cs` and modified many `.xsd` files. Schema regressions are the real risk, not just `Service.add()`.

Add these to the test plan:

1. **Watch the actual `Service.add()` log line.** From the issue doc, the failure mode is silent — `CreateOrder-Calling Service.add()...` with no follow-up. If we see "Service.add() returned" within the 3-min cron window, the hang is gone **for that order**. One success is not proof, but one hang is proof it is not fixed.
2. **Test `SyncUpdate` too**, not just `SyncCreate`. Make a small edit to an existing synced order and re-sync. Same WSDL, different code path ([NSClientOrdersModel.cs:350](../SuiteTalk/NSClientOrdersModel.cs#L350)).
3. **Test the import side** — at minimum `import-salesorders` and `import-customers`. These deserialize SOAP responses using the new generated types. If a field changed shape between 2020.1 and 2024.1 we will see an `InvalidOperationException` during XML deserialization, not a sync failure.
4. **Sanity-check `getDataCenterUrls`** — it is called on every `DataCenterAwareNetSuiteService` construction ([NSClient.cs:147](../SuiteTalk/NSClient.cs#L147)). If it fails, nothing else runs.
5. **Run in a non-prod env first** if possible (the App.config currently points at `635786_SB3` — sandbox 3 — confirm the deploy target uses that, not prod).
6. **Run the full scheduler tick, not just one manual step.** The hang only reproduces under the scheduler's 3-min kill window. A manual one-shot run may "succeed" simply because `Service.Timeout = 10 min` is large enough to not get killed.

---

## Empirical confirmation (2026-05-14)

Tested by Camil Plojovic by deploying `dev-migrating-ns-webservices-to-v2024` (WSDL 2024.1 upgrade, **without** the BULNS-13132 recovery fix) to the sandbox processor environment and attempting to sync a new order.

### Setup

- **Test order:** `SOPH1300002860` — `NS_Sync_Order.Id = 12066367`, local `TransactionId = 2307719`, US BU.
- **Branch deployed:** `dev-migrating-ns-webservices-to-v2024`, head commits at test time (newest first):
  - `ab0f5b9cd` — cherry-pick of `hotfix/BULNS-13159` (removes `SpecialDescription` column — required to get past an unrelated SQL blocker, see below)
  - `5749e1192` — "Fixed syncing orders"
  - `a8aa41a5e` — "deleted old 2020_01 and added 2024_01 web services model" (the WSDL bump being tested)
- **NetSuite environment:** sandbox 3 (`635786_SB3`), endpoint resolved to `https://635786.suitetalk.api.netsuite.com/services/NetSuitePort_2024_1` — confirming the 2024.1 path is in use.
- **BULNS-13132 recovery code:** NOT present on this branch.

### Preliminary blocker (unrelated to WSDL)

First test attempt at 12:40 UTC failed with `System.Data.SqlClient.SqlException: Invalid column name 'SpecialDescription'` at [NSClientOrdersModel.cs:1367](../SuiteTalk/NSClientOrdersModel.cs#L1367) (the LINQ query reading `data.OEPItem`).

**Cause:** branch drift — the deployed database had already run RoundHouse migration `0278_Remove_SpecialDescription_Column.sql` (from hotfix BULNS-13159 merged on `master`/`dev`), dropping the `SpecialDescription` column. The WSDL branch was forked before that hotfix and its EF models still referenced the column. **Not related to the WSDL upgrade.**

**Resolution:** cherry-picked commit `05a8a2cfd` (BULNS-13159) into the branch, rebuilt `BullsM.Processor.exe`, and redeployed. The SQL error disappeared on the next run.

### The Akamai hang reproduced

After the SQL fix, the 13:08 UTC run progressed through the full order-build path and reached `Service.add()`. The log ends abruptly at:

```
13:08:40.023  INFO  CreateOrder-tokenPassport: d6db30efcd36eb7c500b37e1b1ad06013dcfecea1214bcf4ad5a26e180454d37
[no further log entries from InstanceGUID d9225fd6-63c2-4b9c-ae48-a8f294405b72]
```

That log line is emitted at [NSClientOrdersModel.cs:1467](../SuiteTalk/NSClientOrdersModel.cs#L1467), immediately before the SOAP call at [NSClientOrdersModel.cs:1485](../SuiteTalk/NSClientOrdersModel.cs#L1485):

```csharp
UpdateStatusMessage("CreateOrder-tokenPassport: " + Service.tokenPassport.token);  // line 1467 — last log
try
{
    if (firstRun)
    {
        writeRes = Service.add(salesOrder);  // line 1485 — call dispatched, no further logs
    }
    ...
}
catch (Exception ex)
{
    ...
    UpdateStatusMessage("CreateOrder-Retrying syncing ...");  // would have logged if any exception was thrown
}
```

No "Retrying syncing" (which means no exception was thrown), no success-path log (which means `Service.add()` did not return). The only consistent explanation: `Service.add()` blocked waiting for a response that never arrived, and the scheduler killed the process at the 3-min boundary.

### Database state after the hang

`NS_Sync_Order` row `Id = 12066367` immediately after the killed run:

| Column | Value | Interpretation |
|---|---|---|
| `NS_Id` | `0` | No NetSuite internal ID received |
| `NS_Number` | `SOPH1300002860` | Pre-assigned by `NS_Sync_OrderInsert` DB trigger at insert time, not from NS |
| `Synced` | `0` | Sync not marked complete |
| `Error` | `0` | Not marked failed either — **middle/stuck state** |
| `IsTransactionInProcessing` | `1` | **Lock SET on pickup, never released** — process was killed externally, no `finally` block in this branch |
| `LastSyncRequest` | `2026-05-14 13:07:53.730` | When the new attempt began |
| `LastModified` | `2026-05-14 12:25:23.460` | **Stale** — no code path that updates `LastModified` ran during this attempt |
| `ErrorMessage` | "Unexpected Error: …" | Stale leftover from the earlier SQL-error run, before the SpecialDescription cherry-pick |
| `IsTransactionCreatedInNS` | `NULL` | Not set — success branch never ran |

### NetSuite-side state — the smoking gun

Visual check of NetSuite UI: **sales order `SOPH1300002860` exists in NS**, created during the 13:08 attempt. NetSuite processed the request successfully on its side; the response just never traveled back through Akamai to our process.

This matches the exact pattern documented in [sync-order-issue.md](sync-order-issue.md) §"Akamai hang pattern", reproduced on the 2024.1 endpoint with no behavioral difference from 2020.1.

### Conclusion

The prediction in §"What the upgrade definitely doesn't fix" is now confirmed by direct test:

- The 2024.1 endpoint **works**: TBA passport generated, SOAP request dispatched cleanly, NS processed it.
- The Akamai response-hang **is identical** on 2024.1 as on 2020.1.
- The WSDL bump **does not** fix the user-visible problem (stuck orders).
- The actual hotfix is **BULNS-13132** (recovery code), which must be merged into this branch — or shipped to production independently — for the order-sync pain to improve.

This single test does not say anything about whether 2024.1 hangs *less often* than 2020.1 (it could still help statistically). It only proves that 2024.1 is not categorically immune.

### Manual recovery applied

To unstick `SOPH1300002860` for retesting, an in-DB recovery update was prepared (NS internal ID copied from the NetSuite UI, set `Synced=1`, `IsTransactionCreatedInNS=1`, `IsTransactionInProcessing=0`, blank `ErrorMessage`, set `LastSynced`). This is exactly the work that BULNS-13132 Change 4 ("Recovery Path with Full Data") performs automatically; without that fix every Akamai hang requires manual SQL recovery per row.

---

## Known remaining issues after this change

- **The Akamai response-hang is still possible.** If it recurs, the existing duplicate-check + nonce-refresh recovery (Changes 1–4 in [sync-order-issue.md](sync-order-issue.md)) is what actually keeps orders from being lost; the WSDL bump does not replace it.
- **2024.1 is still SOAP and still goes through Akamai.** Per [sync-order-issue.md](sync-order-issue.md) §"Long-term direction", the durable fix is REST + OAuth 2.0 before SOAP is fully disabled in 2028.2.
- **2024.1 itself retires ~2027.1**, so this buys ~1 year. 2025.2 (the last planned SOAP release) would buy through 2028.2.
- **~240K lines of generated `Reference.cs` change** — any custom field, custom record, or saved-search-result shape the code touches could have a schema drift. Will not surface until that specific code path runs in production.

---

## Sources

- [Akamai — Understand the connections](https://techdocs.akamai.com/ion/docs/understand-the-connections)
- [NetSuite — SOAP Web Services Reliability Considerations](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1540364662.html)
- [NetSuite — Troubleshooting Connection Time Out Issues](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_164432951747.html)
- [NetSuite — Handling of Lengthy Requests](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4078474279.html)
- [NetSuite — Troubleshoot DNS Issues with the CDN](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_163829967836.html)
- Local: [sync-order-issue.md](sync-order-issue.md) — original investigation, deeper root-cause section, Changes 1–4
