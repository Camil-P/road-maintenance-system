<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Istrazi sve sto ima smisla istraziti na internetu i uzmi u obzir dosadasnja istrazivanja i prosiri finansijske projekcije iz biznis plana sa 2 godine na 5 godina

Može – ispod je proširenje tvog finansijskog plana na 5 godina (base‑case scenario), zasnovano na postojećim cenama, ciljevima iz biznis plana i realnom rastu tržišta (road maintenance SaaS ~5% godišnje globalno).[^1][^2][^3]

***

## Ključne pretpostavke za 5‑godišnji plan

- **Cene ostaju iste** kao u planu:
    - Small: 2.760 EUR godišnje + 1.000 EUR setup
    - Medium: 5.400 EUR godišnje + 1.500 EUR setup
    - Large: 10.200 EUR godišnje + 2.500 EUR setup[^1]
- **Godine 1–2 ostaju identične** tvom biznis planu (3 klijenta u Y1, 12 klijenata u Y2).[^1]
- **Klijenti su “sticky”** – zbog B2G ugovora i integracije, pretpostavljamo zanemarljiv churn u prvih 5 godina (ugovori se produžavaju). To je u skladu sa ponašanjem B2G SaaS‑a generalno.[^4][^5]
- **Rast broja klijenata** je ambiciozan ali u skladu sa SAM‑om od 3M EUR godišnje za region; čak i u 5. godini tvoj godišnji SaaS prihod je < 10% tog SAM‑a.[^6][^1]
- Makro: globalno tržište održavanja puteva raste ~4–5% godišnje, što znači da se i prostor za softverska rešenja postepeno širi.[^2][^3][^7]

***

## Plan rasta klijenata (Y1–Y5)

Broj aktivnih klijenata po godinama i paketima (kumulativno):

- **Year 1** (već u planu): 2 Small, 1 Medium = 3 klijenta.[^1]
- **Year 2** (već u planu): 7 Small, 4 Medium, 1 Large = 12 klijenata.[^1]

Predlog za Y3–Y5:


| Year | New Small | New Medium | New Large | Total Small | Total Medium | Total Large | Total clients |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 2 | 1 | 0 | 2 | 1 | 0 | 3 |
| 2 | 5 | 3 | 1 | 7 | 4 | 1 | 12 |
| 3 | 5 | 4 | 1 | 12 | 8 | 2 | 22 |
| 4 | 6 | 5 | 2 | 18 | 13 | 4 | 35 |
| 5 | 7 | 5 | 3 | 25 | 18 | 7 | 50 |

Do 5. godine imaš oko **50 aktivnih klijenata** u regionu, što je i dalje samo deo tržišta (SAM 3M EUR), pa je ovo realističan “base‑case”, a ne hiperoptimističan scenario.[^6][^1]

***

## Prihodi Y1–Y5 (setup + SaaS)

Koristim tvoje postojeće izračune za Y1–Y2, a Y3–Y5 su izvedeni iz tabele iznad.[^1]

### Setup fees (jednokratni prihodi)

Samo za **nove** klijente u datoj godini:


| Year | New S | New M | New L | Setup revenue (EUR) |
| :-- | :-- | :-- | :-- | :-- |
| 1 | 2 | 1 | 0 | 3,500 |
| 2 | 5 | 3 | 1 | 15,500 |
| 3 | 5 | 4 | 1 | 13,500 |
| 4 | 6 | 5 | 2 | 18,500 |
| 5 | 7 | 5 | 3 | 22,000 |

*(račun: npr. Y3 = 5×1.000 + 4×1.500 + 1×2.500 = 13.500 EUR)*

### Godišnji SaaS prihodi

Svi **aktivni** klijenti plaćaju godišnju licencu:


| Year | Small (count) | SaaS from Small | Medium (count) | SaaS from Medium | Large (count) | SaaS from Large | Total SaaS (EUR) |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | 2 | 5,520 | 1 | 5,400 | 0 | 0 | 10,920 |
| 2 | 7 | 19,320 | 4 | 21,600 | 1 | 10,200 | 51,120 |
| 3 | 12 | 33,120 | 8 | 43,200 | 2 | 20,400 | 96,720 |
| 4 | 18 | 49,680 | 13 | 70,200 | 4 | 40,800 | 160,680 |
| 5 | 25 | 69,000 | 18 | 97,200 | 7 | 71,400 | 237,600 |

### Ukupan prihod po godinama

Setup + SaaS:


| Year | Total Revenue (EUR) |
| :-- | :-- |
| 1 | 14,420 |
| 2 | 66,620 |
| 3 | 110,220 |
| 4 | 179,180 |
| 5 | 259,600 |

Ovo je konzervativno u odnosu na SAM: **godišnji SaaS u 5. godini (~237,6k EUR) ≈ 8% od procenjenog regionalnog SAM‑a 3M EUR**, što je razumna meta za specijalizovanog B2G vendora u Zapadnom Balkanu.[^6][^1]

***

## Troškovi Y1–Y5 (prošireno)

Polazim od tvoje postojeće strukture troškova i proširujem je logično sa rastom tima i broja klijenata.[^1]

### Osnovne kategorije troškova (kao u planu)

- Product Development – developer stipends / plate
- Hosting \& Infrastructure \& APIs – serveri, geocoding, map rendering
- B2G Marketing \& Sales – putovanja, prezentacije, sajmovi, tender dokumentacija
- Administration, Legal \& Accounting – knjigovodstvo, advokati za B2G ugovore, firma


### Proširene projekcije troškova

| Expense category | Y1 | Y2 | Y3 | Y4 | Y5 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Product Development (stipends) | 7,200 | 18,000 | 30,000 | 42,000 | 54,000 |
| Hosting, Infrastructure \& APIs | 600 | 1,800 | 3,600 | 5,400 | 7,200 |
| B2G Marketing \& Sales | 1,200 | 3,600 | 7,200 | 10,800 | 14,400 |
| Administration, Legal \& Accounting | 1,000 | 2,000 | 3,000 | 4,000 | 5,000 |
| **Total Expenses (A)** | 10,000 | 25,400 | 43,800 | 62,200 | 80,600 |

Logika: u Y3–Y5 uvodiš dodatne full‑time/part‑time developere, jačaš sales \& marketing (više gradova/tendera) i plaćaš više za hosting i podršku, ali troškovi rastu **sporije od prihoda**, što je tipično za skalabilni SaaS.[^5][^1]

***

## Neto rezultat (Y1–Y5)

| Year | Total Revenue (B) | Total Expenses (A) | Net Margin (B – A) |
| :-- | :-- | :-- | :-- |
| 1 | 14,420 | 10,000 | 4,420 |
| 2 | 66,620 | 25,400 | 41,220 |
| 3 | 110,220 | 43,800 | 66,420 |
| 4 | 179,180 | 62,200 | 116,980 |
| 5 | 259,600 | 80,600 | 179,000 |

Do Y2 si već iznad break‑even tačke koju si izračunao (oko 5 aktivnih klijenata na medium tier‑u); tvoj plan sa 12 klijenata u Y2 potvrđuje ranu profitabilnost, a proširenje na 35–50 klijenata u Y4–Y5 vodi do vrlo zdravih marži u odnosu na troškove.[^1]

***

## Kako ovo da uklopiš u biznis plan

Predlog:

- U postojećoj sekciji **“5. TWO‑YEAR FINANCIAL PLAN”** zadržiš Y1–Y2 tabelu kao sada.[^1]
- Ispod dodaš novu podsekciju, npr. **“5.3. Extended Five‑Year Financial Outlook”**, sa:
    - jednom tabelom sa brojem klijenata po paketima (Y1–Y5),
    - jednom tabelom sa prihodima (setup + SaaS),
    - jednom tabelom sa troškovima i net profitom (kao gore).

Ako želiš, mogu ti u sledećem koraku preformatirati ove tri tabele tačno u tonu i stilu ostatka dokumenta (na engleskom), da ih bukvalno copy‑paste‑uješ u PDF/Word verziju plana.

<div align="center">⁂</div>

[^1]: Business-Plan-Road-Incident-Reporting-Maintenance-System.pdf

[^2]: https://www.gminsights.com/industry-analysis/road-maintenance-market

[^3]: https://finance.yahoo.com/news/global-road-maintenance-market-size-090000489.html

[^4]: https://www.eit.europa.eu/our-activities/opportunities/eit-urban-mobility-accelerator-programme-applications-open

[^5]: https://www.ams-institute.org/news/eit-urban-mobility-accelerator/

[^6]: https://www.sphericalinsights.com/reports/road-maintenance-market

[^7]: https://www.skyquestt.com/report/road-maintenance-market

