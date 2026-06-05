<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Istrazi koliko slicnih sofware resenja se koristi i prodaje u svetu i kako zaradjuju. Ako nema slicnih, zasto nema i da li se ja sa ovim software-om mogu "probiti" u Srbiji i sire. Ono sto ja znam da je slican software, ali bez ponude agencijama za puteve jeste [https://www.waze.com/](https://www.waze.com/)

Tvoj sistem spada u postojeću, već prilično razvijenu klasu “citizen reporting + road maintenance” SaaS rešenja, a globalno postoji više konkurentskih proizvoda – većina zarađuje od godišnjih SaaS licenci koje plaćaju gradovi/opštine, plus integracije i konsulting. U Srbiji takvih lokalizovanih rešenja gotovo da nema, što ti ostavlja realnu šansu da se probiješ prvo lokalno, a onda regionalno, uz pametno pozicioniranje i model naplate.[^1][^2][^3][^4]

***

## Postojeća slična rešenja u svetu

Postoji čitav ekosistem rešenja koja rade vrlo sličnu stvar kao tvoj sistem: građani prijavljuju probleme (rupe, oštećenja, klizišta), a nadležna služba dobija dashboard, radne naloge i istoriju radova.[^5][^6]
Primeri:

- **SeeClickFix 311 CRM (CivicPlus)** – platforma za prijavu komunalnih problema, praćenje statusa i radne naloge za lokalne samouprave.[^7][^8]
- **FixMyStreet / FixMyStreet Pro (SocietyWorks, UK)** – javni sajt + napredna “Pro” verzija koju kupuju opštine, upravo za prijavu rupa, oštećenja na putu i sl.[^3][^9]
- **CityReporter, Novo Solutions i drugi “road maintenance system” alati** – fokus na inspekcije, evidenciju radova i asset management za puteve.[^10][^11]
- **Razne “pothole reporting” aplikacije** – npr. vladin projekat “Fill That Hole” u UK ili druge aplikacije za prijavu rupa i oštećenja putem telefona.[^12][^13][^14]

Pored komercijalnih proizvoda postoji i dosta akademskih i open‑source projekata za “citizen‑driven road maintenance”, ali oni uglavnom ostaju na nivou prototipa ili lokalne implementacije.[^15][^16][^17]

***

## Kako ta rešenja zarađuju

Glavni monetizacioni modeli koje vidiš u praksi:

- **Godišnje SaaS licence po opštini/gradu**
    - FixMyStreet Pro se prodaje kao SaaS po lokalnoj vlasti, sa pristupom za službenike.[^18][^9]
    - Javne cene za FixMyStreet Pro u UK su npr. **15.000–68.000 funti godišnje po instanci**, u zavisnosti od paketa i veličine opštine.[^4][^3]
    - SeeClickFix se takođe prodaje kao **godišnji “recurring SaaS license”** za oko 300 klijenata (uglavnom lokalne samouprave).[^19][^8]
- **Tiers / paketi + dodatne usluge**
    - FixMyStreet Pro ima više planova (Essential, Advanced, Premium, Premium Plus) sa rastućom cenom po godini.[^4]
    - Često se dodatno naplaćuju integracije sa postojećim sistemima (npr. preko Open311 API‑ja) i održavanje tih integracija.[^9][^3]
- **“Mobile platform as a service” integrisana sa postojećim asset‑management sistemima**
    - Primer: CitySourced + Cityworks – mobilna aplikacija koja se integrira u postojeći cityworks sistem za radne naloge; prezentacija navodi cenu od **3.600 USD za 3 godine** kao turnkey rešenje.[^20]
- **Potrošačke aplikacije tipa Waze – oglasi i prodaja podataka**
    - Waze ne naplaćuje gradovima korišćenje “Waze for Cities”; to je **besplatan program razmene podataka** gde lokalne vlasti daju informacije o radovima, a zauzvrat dobijaju Waze podatke o gužvama i incidentima.[^21][^22]
    - Waze zarađuje pre svega preko **lokacijskih reklama, sponzorisanih pretraga, data‑licenciranja i partnerstava** (Waze for Business, data analitika za oglašivače i planere).[^23]

Zaključak: mainstream model za tvoj tip proizvoda je **B2G SaaS licenca + integracije/konzalting**, a ne B2C naplata građanima.

***

## Gde je tvoj sistem sličan, a gde se razlikuje

Iz dokumenta koji si poslao vidi se da tvoj sistem pokriva tri ključna sloja: aplikaciju za građane, radni sto za preduzeće za puteve i mapu resursa/ekipa.[^1]

- **Za građane**:
    - Mapa sa prikazom radova, zatvaranja i rizičnih deonica.[^1]
    - Brza prijava incidenta (lokacija, tip problema, fotografija, opis) i praćenje statusa prijave.[^1]
- **Za preduzeće/agenciju**:
    - Centralni pregled svih prijava sa mape i liste.[^1]
    - Prioritetizacija (hitno/važno/može da čeka) i otvaranje **radnih naloga** direktno iz prijava.[^1]
    - Praćenje rada na terenu (statusi naloga, slike pre/posle, napomene) i istorija radova po deonici.[^1]
    - Izveštaji i dashboard za planiranje i izveštavanje ka ministarstvu/opštini.[^1]
- **Mapa resursa i komunikacija ka javnosti**:
    - Prikaz vozila i ekipa na mapi, povezivanje naloga sa najbližim resursima.[^1]
    - Modul za vesti/obaveštenja o radovima, zatvaranjima, preusmerenjima saobraćaja.[^1]

To funkcionalno izgleda najbliže kombinaciji **FixMyStreet Pro + sistem za radne naloge (tipa Cityworks)**, a manje liči na Waze, koji jeste crowdsourced navigacija, ali nema built‑in workflow za radne naloge i evidenciju radova za agencije.[^22][^9]

***

## Da li “nema sličnih” i zašto ih ne vidiš često

Na globalnom nivou sličnih rešenja ima dosta – pre svega u Severnoj Americi i Zapadnoj Evropi, često u paketu sa širim “smart city” ili asset‑management platformama.[^11][^5]
Razlog što deluje da ih “nema” kod nas (Srbija / region) je više u **tržišnoj zrelosti** nego u ideji:

- Javne komunalne firme i direkcije za puteve često rade sa telefonom, mejlom i Excelom, pa im se “nov sistem” doživljava kao dodatna komplikacija, a ne automatno kao ušteda.
- Javne nabavke traju dugo, preferiraju se “veliki” dobavljači ili postojeći sistemi (npr. ERP, DMS), a specijalizovani SaaS za puteve teško dolazi na red.
- Ne postoji navika građana da za ovakve stvari koriste specifičnu aplikaciju – trenutno većina ide preko call centra, Viber/FB strane opštine ili e‑maila.

Drugim rečima: **nije da nema sličnih proizvoda u svetu, nego nema još dovoljno lokalizovanih implementacija i uspostavljenih dobavljača u Srbiji i regionu**. To je više prilika nego problem, ako ideš strpljivo.

***

## Šanse da se probiješ u Srbiji

Po onome što se koristi u svetu i po tome kako je tvoj sistem definisan, postoji realna šansa da se pozicioniraš kao **specijalizovano, lokalno rešenje za puteve**:

**Prednosti koje već imaš:**

- Rešenje je **tačno ono što razvijene zemlje već kupuju kao SaaS** – centralizovane prijave + radni nalozi + mapa resursa.[^5][^3][^1]
- Lokalni jezik, poznavanje realnog rada preduzeća za puteve u Srbiji, mogućnost da prilagodiš sistem našim propisima i načinu izveštavanja (ministarstvo, javna preduzeća).[^1]
- Možeš da ponudiš **znatno nižu godišnju licencu** nego što plaćaju UK/US gradovi (oni plaćaju desetine hiljada evra godišnje).[^3][^4]

**Glavni izazovi:**

- **Dug prodajni ciklus** – da jedna direkcija za puteve uvede ovakav sistem, priča ume da traje 6–18 meseci (pilot, test, budžet, tender).
- Potrebno ti je **političko i rukovodilačko “sponzorstvo”** unutar preduzeća ili ministarstva – bez toga sistem ostane “interesantan, ali…” u fioci.
- Verovatno će tražiti integraciju sa postojećim softverima (npr. finansije, knjigovodstvo, GIS), što moraš uračunati u cenu i kapacitet razvoja.

***

## Model zarade koji ima smisla za tebe

Na osnovu globalnih praksi, a prilagođeno Srbiji, racionalan model za početak bi bio:

1. **Godišnja licenca po preduzeću / opštini**
    - Npr. 5–15k € godišnje za manjeg klijenta, više za nivo pokrajine ili države (kasnije možeš praviti “pakete” po veličini mreže puteva).
    - To je uporedivo sa nižim segmentom FixMyStreet Pro planova, ali i dalje višestruko manje od tipičnih zapadnih cena.[^3][^4]
2. **Jednokratna naknada za implementaciju i obuku**
    - Migracija postojećih podataka (ako ih imaju), konfiguracija mapa, podešavanje nadležnosti i prava pristupa.
    - To je praksa i kod FixMyStreet Pro i kod drugih B2G rešenja – često se posebno naplaćuju integracije i početno podešavanje.[^9][^3]
3. **Opcioni dodatni moduli**
    - Npr. modul za dashboards, napredne izveštaje, API integracije, analitiku (heatmap prijava, prediktivno planiranje).
    - Ovo možeš kasnije da naplaćuješ kao “add‑on” nad baznim paketom.
4. **Pilot besplatno ili po minimalnoj ceni za jednu–dve opštine**
    - U svetu je uobičajeno da ovakvi sistemi rade pilote pre šireg ugovaranja, a i Waze for Cities daje podatke besplatno da bi povećao adoption.[^21][^22]
    - Jedan uspešan, javno vidljiv pilot sa konkretnim rezultatima (broj prijava, vreme reakcije, manje pritužbi) bi ti bio najbolji marketing.

***

## Potencijal da izađeš van Srbije

Ako rešiš:

- da sistem bude **multitenant** (više preduzeća na istoj platformi),
- da imaš **višejezičku podršku** i
- da se zasniva na standardima koje već koriste gradovi (Open311, export u Excel/CSV, GIS integracije),[^5][^9]

onda možeš relativno lako da ga ponudiš i:

- gradovima u regionu (BiH, Crna Gora, Severna Makedonija, Hrvatska) koji imaju sličan nivo digitalizacije,
- manjim gradovima u EU koji žele jeftinije rešenje od velikih zapadnih vendora, ali im treba EU‑compliant hosting i podrška.

Globalno tržište je konkurentno (FixMyStreet Pro, SeeClickFix, razni vendor‑i), ali **na nivou Balkana i istočne Evrope nema mnogo specijalizovanih, lokalno prilagođenih SaaS rešenja za puteve**, što ti daje prostor da budeš “prvi na terenu”.[^11][^5]

***

## Šta bih konkretno uradio na tvom mestu (sa ovim što već imaš)

- Izabrao 1–2 **konkretna ciljana klijenta** (npr. jedna opštinska direkcija za puteve + jedno pokrajinsko/javno preduzeće) i fokusirao pitch baš na benefite koje opisuješ: manje izgubljenih prijava, jasni prioriteti, istorija radova i spremni izveštaji.[^1]
- Pripremio **vrlo konkretan biznis case**:
    - koliko prijava mesečno sada gube,
    - koliko ljudi se javlja telefonom,
    - koliko sati dispečera i šefova se troši na koordinaciju bez sistema,
    - kako se to menja sa tvojim rešenjem.
- Ponudio **pilot na 6–12 meseci** sa obavezom da im posle toga pošalješ izveštaj: broj prijava, vreme rešavanja, transparentnost, pritužbe građana pre/posle.
- Već sada pripremao arhitekturu i kod tako da sutra možeš da ga nadogradiš do nivoa FixMyStreet Pro/SeeClickFix (Open311, exporti, napredni dashboard‑i), jer se baš tako pozicioniraju globalni igrači.[^2][^9][^3]

Zaključak: ideja i funkcionalnosti tvog sistema su već globalno potvrđene i postojeće firme uspešno zarađuju od ovakvih rešenja; razlika je što ti imaš šansu da budeš **prvi lokalni specijalizovani vendor za puteve** u Srbiji i regionu, pod uslovom da prihvatiš da je prodaja spor B2G maraton, a ne brz B2C sprint.[^19][^3][^1]
<span style="display:none">[^24][^25][^26][^27][^28][^29][^30][^31]</span>

<div align="center">⁂</div>

[^1]: OfferForAgencies.md

[^2]: https://www.civicplus.com/seeclickfix-311-crm/

[^3]: https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/750036126019114

[^4]: https://www.societyworks.org/how-to-buy/

[^5]: https://www.mark-a-spot.com/citizen-reporting-platforms

[^6]: https://www.ijert.org/research/web-based-solution-for-road-management-and-public-complaint-registry-IJERTCONV11IS03015.pdf

[^7]: https://getlatka.com/companies/seeclickfix

[^8]: https://leadiq.com/c/seeclickfix/5a1d82e824000024005db700

[^9]: https://www.fixmystreet.com/about/information-for-councils

[^10]: https://www.cityreportersoftware.com/solutions/roads-highways/

[^11]: https://novosolutions.com/asset-management-software/road-maintenance-system/

[^12]: https://www.gov.uk/government/news/government-backs-smartphone-app-to-pinpoint-potholes

[^13]: https://pubsafe.net/best-app-reporting-road-damage/

[^14]: https://sccapstone.github.io/Pothole-Reporter/

[^15]: https://www.scribd.com/presentation/953866313/Citizen-Feedback-Road-Maintenance

[^16]: https://www.ijcsejournal.org/wp-content/uploads/2025/11/AI-Enabled-Smart-Road-Monitoring-Integrating-Citizen-Feedback-and-Data-Analytics-for-Infrastructure-Maintenance.pdf

[^17]: https://github.com/nirbhayph/spothole

[^18]: https://radar.senraio.com/compare-fixmystreet-pro/

[^19]: https://streetfightmag.com/2017/01/19/seeclickfix-grows-its-base-to-over-one-million-problem-flagging-citizens/

[^20]: https://www.slideshare.net/slideshow/future-of-citizen-engagement-asset-management-with-citysourced-and-cityworks/74397683

[^21]: https://support.google.com/waze/partners/answer/10618477?hl=en

[^22]: https://en.wikipedia.org/wiki/Waze

[^23]: https://whitelabelfox.com/waze-business-model/

[^24]: https://www.xweather.com/blog/roadai-road-asset-management-for-municipalities

[^25]: https://www.govtech.com/data/Esri-Waze-Partnership-A-Growing-Trend-in-Sharing-Data-for-the-Benefit-of-All.html

[^26]: https://getlatka.com/companies/seeclickfix/vs/icompletecom

[^27]: https://www.softwareadvice.com/crm/seeclickfix-profile/

[^28]: https://www.getapp.co.uk/software/2057980/seeclickfix

[^29]: https://research.contrary.com/company/citizen

[^30]: https://www.softwaresuggest.com/seeclickfix-311-crm

[^31]: https://amulyayadav.github.io/aasg2021/AASG_2021_paper_7.pdf

