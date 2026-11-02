# Pulsar FM — kontekst projektu

Notatki dla Claude Code. Projekt powstał w rozmowie z autorem (Dom) 30.10–1.11.2026. Ten plik zbiera ustalenia, żeby nowa sesja nie zaczynała od zera.

## Czym to jest

Pulsar FM to muzyka generatywna i wizualizacja grane **na żywo z danych o pogodzie kosmicznej i z pulsarów**. Mapa nieba działa jak radio: wybierasz pulsar (stację), a on wyznacza gatunek, tempo albo tonację. Dane o Słońcu sterują nastrojem, gęstością, jasnością brzmienia i wydarzeniami.

Hasło robocze: „w kosmosie nie ma dźwięku, więc go robimy”.

Osobny projekt od Aurora Now (`dgrochowicki/Aurora`, prognoza zorzy). Ten sam autor ma też `dgrochowicki/Nightsky` („co dziś widać na niebie”), z którym Pulsar FM może się kiedyś łączyć (np. pulsar nad tobą).

## Technika

- Jeden plik `index.html`, bez kroku budowania. Język interfejsu: polski.
- Dźwięk: **Tone.js 14.8.49** z jsDelivr (`Tone.Transport`, `Tone.Draw`; nie przechodzić na v15 bez potrzeby, tam zmieniło się API).
- Obraz: Canvas 2D, własne rysowanie, bez bibliotek.
- Hosting: GitHub Pages z gałęzi `main` (plik `.nojekyll` jest w repo).
- Podgląd jako artefakt w Claude blokuje sieć, lokalizację i czujniki. Dlatego aplikacja ma wbudowany zapis prawdziwych pomiarów NOAA z 18.10.2026 (`const SNAP` w `index.html`) i tryb „Burza” z danymi umownymi (tylko pod `?dev`). **Prawdziwe testy z siecią robić lokalnie lub na GitHub Pages.**
- iPhone: przy włączonym przełączniku wyciszenia Safari wycisza Web Audio.
- Test dymny: `tests/smoke.mjs` (Playwright), opis niżej.

## Źródła danych (obecne)

| Dane | Endpoint | Rola |
|---|---|---|
| Wiatr słoneczny (prędkość, gęstość) | `services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json` | wiersze od najnowszego, oficjalna sonda ma `active: true` |
| Bz | `.../json/rtsw/rtsw_mag_1m.json` | jak wyżej |
| Kp | `.../products/noaa-planetary-k-index.json` | ostatni wiersz |
| Rozbłyski | `.../json/goes/primary/xrays-6-hour.json` | pasmo `0.1-0.8nm`, klasa A/B/C/M/X z `flux` |

Odświeżanie co 60 s. Rozbłysk dźwiękowo tylko przy nowym (od klasy C): klasa wyższa niż wszystko z poprzednich 3 godzin, nie przy pierwszym odczycie. Przy chwilowej awarii sieci aplikacja trzyma ostatni pomiar; zapis z 18.10 gra tylko, gdy nigdy nie było danych na żywo.

## Mapowanie danych

Wspólne dla wszystkich gatunków (obiekt `E` w kodzie, wartości 0–1):

| Dane | Dźwięk | Obraz |
|---|---|---|
| Prędkość wiatru | jasność brzmienia (filtry), wysokość motywów; w Ambiencie ostatnie 16 minut wyznacza wysokości melodii (`windDegrees`) i barwę pada (`windPartials`) | prędkość cząstek/kresek/fal, korona Słońca |
| Gęstość wiatru | ile się dzieje (gęstość motywów, dodatkowe warstwy) | liczba cząstek/kresek/fal |
| Prędkość × gęstość | – | odległość magnetopauzy (Chapman–Ferraro, kształt Shue) |
| Bz < −2 nT | mroczna skala; wspólny niski bas rośnie z −Bz; w techno brzmienie acid | kolor (różowy/bursztynowy) |
| Kp | wysoka poświata (shimmer) | zorza |
| Rozbłysk (C/M/X) | **trailerowe uderzenie**: C = niskie „buuum” z opadającą wysokością; M = + przesterowany akord „braam” z otwierającym się filtrem; X = pełny braam z tercją + szum | koła/drganie Słońca/znak f–fff |

Decyzje autora: **żadnych dzwonków przy rozbłysku** (ma być jak w zwiastunie filmu); **bas w techno głęboki**, nie „sztuczny” piłokształtny.

## Pulsary i gatunki

Wolny pulsar (okres ≥ 0,2 s) ustala **tempo** (błysk = uderzenie, BPM sprowadzane do 60–120 przez mnożenie/dzielenie przez 2). Szybki pulsar **gra sam siebie** ciągiem impulsów o prawdziwej częstotliwości i ustala **tonację**: cały utwór transponowany do najbliższej nuty i dostrojony w centach (`musicFor()`).

Automatyczny wybór pulsara używa geolokalizacji i czasu UTC, aby co minutę wybrać najwyżej położony nad horyzontem pulsar z katalogu. Gdy geolokalizacja jest niedostępna lub odmówiona, używa Szczecina; ręczny wybór z mapy wyłącza tryb automatyczny.

| Pulsar | Okres | Gatunek | Uwagi |
|---|---|---|---|
| PSR J2144−3933 | 8,51 s | Drone | gong co 8,5 s |
| PSR B1919+21 | 1,337 s | Chorał | pierwszy odkryty pulsar |
| PSR B0329+54 | 0,7145 s | Ambient | domyślny |
| Geminga | 0,2371 s | Minimal techno | 30/P = 126,5 BPM; błyski = hi-hat na ósemkach. **Autor: „mega”** |
| Vela | 89,3 ms | Glitch | 11,2 Hz = trzydziestodwójki przy 84 BPM |
| Krab | 33,7 ms | Dub | ok. 30 Hz, najniższy bas |
| PSR J0437−4715 | 5,757 ms | Szklany chór | 173,7 Hz ≈ F3 −9 c |
| PSR J1748−2446ad (Terzan 5) | 1,396 ms | Pozytywka (3/4) | 716 Hz |

Okresy i położenia są z pamięci modelu (literatura/ATNF). **Do zweryfikowania z katalogiem** przy etapie 2.

Pełny opis syntezy i instrumentów: `docs/DZWIEK.md` (aktualizować przy zmianach w `GENRES`). Muzyka to reguły, nie model AI: każdy gatunek w `GENRES` ma `make(B)` zwracające `{ nodes, tun, step(t, s, bar), pulse?(t) }`. Melodie to klasa `Motif` (fraza, która się powtarza i co kilka taktów mutuje), żeby było słychać melodię, a nie losowe nuty.

## Style graficzne

Przełącznik u góry ma najpierw szkice nowych kierunków z `docs/WIZUALIZACJE.md`: **Grzbiety** (domyślny), **Fale** (dawne Słoje: Słońce w środku, fale we wszystkie strony; pomysł autora), **Cymatyka**, **Kolor** (kod w sekcjach „Kierunek” w `index.html`, numeracja jak w `docs/WIZUALIZACJE.md`). Potem stare style: **Bauhaus** (płaskie koła i łuki), **Oscyloskop** (jedna świecąca linia; Słońce to kształt fali dźwięku z `Tone.Waveform`). Autor: Słońce i Ziemia w wersji dosłownej były „zbyt dosłowne”; szuka abstrakcji, z której nadal wiadomo, o co chodzi. Kierunek graficzny **niezdecydowany**; obecne style autor uznał za „dość łopatologiczne”. Nowe propozycje z opisem i rekomendacją: `docs/WIZUALIZACJE.md`. Linie pola, Partytura i Kosmos usunięte na prośbę autora (2.11.2026).

Wybór pulsara: mapa całego nieba (rzut Hammera–Aitoffa, RA 12h w środku, rośnie w lewo, Droga Mleczna z konwersji b = 0). Każdy pulsar miga w swoim prawdziwym rytmie; szybkie mają drgający pierścień. **Autor nie chce listy, tylko wybór z grafiki.**

## Tylko prawdziwe dane

Decyzja autora (2.11.2026): słuchacz niczego nie wywołuje sam. Są tylko tryby „Na żywo” i „Zapis 3 h”. Przycisk Burza, „Wywołaj rozbłysk” i suwaki działają wyłącznie pod adresem z `?dev`, do dopracowywania obrazu.

## Plan (zatwierdzony przez autora 1.11.2026)

Zasada: każde nowe źródło danych dostaje **jedną wyraźną rolę**, żeby nie zrobił się szum.

**Etap 1**
- [x] GitHub Pages działa, sprawdzone na żywo 1.11.2026: NOAA (CORS) i SDO.
- [x] **Pulsar nad tobą**: z lokalizacji (geolokalizacja, fallback Szczecin) i czasu wybrać pulsar najwyżej nad horyzontem; muzyka zmienia się w ciągu nocy. Ręczny wybór z mapy zostaje i wyłącza tryb „auto”.

**Etap 2**
- [ ] Kilkaset pulsarów z katalogu ATNF na mapie; gatunek automatycznie wg okresu, 8 obecnych jako wyróżnione z ręcznymi gatunkami.
- [ ] Pobranie katalogu: `pip install psrqpy`, potem `QueryATNF(params=['JNAME','BNAME','RAJD','DECJD','P0','S1400','DIST','PB','ASSOC','TYPE'])` i zapis do `data/pulsars.csv` (lub JSON). Odfiltrować jasne/znane, żeby mapa była czytelna.
- [ ] Zweryfikować okresy i położenia 8 obecnych pulsarów.
- [ ] Pulsary podwójne (`PB`): lekkie falowanie rytmu (swing/vibrato) z orbity.
- [ ] Na telefonie mapa jest mała: przybliżanie palcem.

**Etap 3: nowe głosy**
- [ ] Promienie kosmiczne: monitor neutronów (np. Oulu, NMDB), liczba cząstek co minutę → ciągła faktura/szum.
- [ ] Przelot ISS (CelesTrak + satellite.js) → krótki motyw melodyczny, gdy stacja jest nad słuchaczem.
- [ ] Fale grawitacyjne: publiczne alerty LIGO/Virgo/KAGRA (GraceDB/GCN; przebieg IR1 startuje ok. listopada 2026) → rzadkie wielkie wydarzenie.
- [ ] Ruch telefonu (DeviceOrientation, na iOS wymaga zgody) → filtr i przestrzeń.

**Muzyka najpierw (decyzja autora, 2.11.2026)**
Na razie muzyka ważniejsza od obrazu. Autorowi podoba się brzmienie gatunków z aplikacji: nie budować nowych od zera, tylko podmieniać w nich źródło nut.
- [x] Ambient: wiatr pisze wysokości melodii, głębszy i dłuższy bit.
- [x] Pad w Ambiencie: barwa z wiatru (`windPartials`), wybrana przez autora po porównaniu.
- [ ] Pomysł do sprawdzenia: chór magnetosfery (University of Iowa, space-audio.org, licencja do potwierdzenia: strona główna CC BY 4.0, stopka podstrony „All rights reserved”). Jako ciągły pad nie zadziałał, „prawie nie gra”, ale same dźwięki autorowi się podobały; może rzadkie wydarzenie zamiast tła.
- [x] Ambient: nuta melodii tylko przy wyraźnej zmianie wiatru (`windChange`), jeden pomiar na ósemkę; gęstsze tło, akord co około 11 s.
- [ ] Ambient, wnioski z porównania z Brain.fm (nagranie autora): niska warstwa rytmiczna 100–250 Hz, cichy wysoki akcent, próba drżenia 18 Hz. Po kolei, każde do oceny na słuch.
- [ ] Przenieść melodię z wiatru na Techno i kolejne gatunki.
- [ ] Pomysły: strojenie zamiast przełączania pulsarów, bez odlotu z Ziemi; nazwa „wiatr dotrze za N minut”; docelowo stream.

**Później / do rozważenia**
- [ ] Porównanie z Lyria RealTime (Google, Gemini API): model AI sterowany opisem gatunku + `bpm`, `density`, `brightness`. Możliwa hybryda: Lyria gra tło w gatunku pulsara, a pulsar i rozbłyski zostają w Tone.js. Wymaga klucza API i małego serwera.
- [ ] Wybór kierunku graficznego: szkice z `docs/WIZUALIZACJE.md` (bez usuniętych Linii pola) są w przełączniku. Autor po obejrzeniu Fal: „to jeszcze nie to”, sam jeszcze nie wie, co dalej. Autor wybiera; niewybrane style usunąć.

## Test dymny

```bash
npm i -D playwright && npx playwright install chromium
node tests/smoke.mjs
```

Sprawdza: brak błędów strony, start dźwięku, wszystkie gatunki grają (RMS > 0), rytm po zmianie stacji i po Stop/Play, ciszę po Stop, echo i strojenie, rozbłyski, awarię sieci, wznowienie dźwięku, dane bez klatek animacji; screenshoty stylów w `tests/out/`.
