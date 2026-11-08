# Pulsar FM — kontekst projektu

Notatki dla Claude Code. Projekt powstał w rozmowie z autorem (Dom) 30.10–1.11.2026. Ten plik zbiera ustalenia, żeby nowa sesja nie zaczynała od zera.

## Czym to jest

Pulsar FM to muzyka generatywna i wizualizacja grane **na żywo z danych o pogodzie kosmicznej i z pulsarów**. Mapa nieba działa jak radio: wybierasz pulsar (stację), a on wyznacza gatunek, tempo albo tonację. Dane o Słońcu sterują nastrojem, gęstością, jasnością brzmienia i wydarzeniami.

Hasło robocze: „w kosmosie nie ma dźwięku, więc go robimy”.

Osobny projekt od Aurora Now (`dgrochowicki/Aurora`, prognoza zorzy). Ten sam autor ma też `dgrochowicki/Nightsky` („co dziś widać na niebie”), z którym Pulsar FM może się kiedyś łączyć (np. pulsar nad tobą).

## Technika

- Jeden plik `index.html` plus próbki w `audio/` (CC0, opis w `audio/README.md`), bez kroku budowania. Język interfejsu: **angielski** (decyzja autora, 8.11.2026); rozmowa z autorem, komentarze w kodzie, narzędzia pod `?dev` i dokumenty zostają po polsku. W interfejsie Chorał to „Chorale”, Pozytywka to „Music box”.
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

Odświeżanie co 60 s. Rozbłysk dźwiękowo tylko przy nowym (od klasy C): klasa wyższa niż wszystko z poprzednich 3 godzin, nie przy pierwszym odczycie. Przy chwilowej awarii sieci aplikacja trzyma ostatni pomiar; zapis z 18.10 gra, gdy nigdy nie było danych na żywo albo nie ma ich od 10 minut (`onRecording()`, minuta zapisu na minutę), i sam wraca do Live.

## Mapowanie danych

Wspólne dla wszystkich gatunków (obiekt `E` w kodzie, wartości 0–1):

| Dane | Dźwięk | Obraz |
|---|---|---|
| Prędkość wiatru | jasność brzmienia (filtry), wysokość motywów; w Ambiencie ostatnie 16 minut wyznacza wysokości melodii (`windDegrees`) i barwę pada (`windPartials`) | prędkość cząstek/kresek/fal, korona Słońca |
| Gęstość wiatru | ile się dzieje (gęstość motywów, dodatkowe warstwy) | liczba cząstek/kresek/fal |
| Prędkość × gęstość | – | odległość magnetopauzy (Chapman–Ferraro, kształt Shue) |
| Bz < −2 nT | mroczna skala; wspólny niski bas rośnie z −Bz | kolor (różowy/bursztynowy) |
| Kp | wysoka poświata (shimmer) | zorza |
| Rozbłysk (C/M/X) | **trailerowe uderzenie**: zawsze prawdziwy bęben wielki (uderzenie, po 2 s pocieranie membrany) i niskie „buuum” z opadającą wysokością (C); M = + przesterowany akord „braam” z otwierającym się filtrem; X = pełny braam z tercją + szum | koła/drganie Słońca/znak f–fff |

Decyzje autora: **żadnych dzwonków przy rozbłysku** (ma być jak w zwiastunie filmu); **bas w techno głęboki**, nie „sztuczny” piłokształtny.

## Pulsary i gatunki

Każdy pulsar ma **tempo z błysków**, tylko przez mnożenie lub dzielenie przez 2, w zakresie 80–160 BPM (`bpmFor()`; Liquid `tempoFloor: 100`). Karta pulsara opisuje to jednakowo (`psrFacts()`).

Wolny pulsar (okres ≥ 0,2 s) ma też błysk słyszalny wprost. Szybki pulsar **gra sam siebie** ciągiem impulsów o prawdziwej częstotliwości i ustala **tonację**: cały utwór transponowany do najbliższej nuty i dostrojony w centach (`musicFor()`).

Automatyczny wybór pulsara używa geolokalizacji i czasu UTC, aby co minutę wybrać najwyżej położony nad horyzontem pulsar z katalogu. Gdy geolokalizacja jest niedostępna lub odmówiona, używa Szczecina; ręczny wybór z mapy wyłącza tryb automatyczny.

| Pulsar | Okres | Gatunek | Uwagi |
|---|---|---|---|
| PSR J2144−3933 | 8,51 s | Drone | gong co 8,5 s |
| PSR B1919+21 | 1,337 s | Chorał | pierwszy odkryty pulsar |
| PSR B0329+54 | 0,7145 s | Ambient | domyślny |
| Geminga | 0,2371 s | Minimal techno | 30/P = 126,5 BPM; błyski = hi-hat na ósemkach. **Autor: „mega”** |
| PSR B0950+08 | 0,2531 s | Deep | 30/P = 118,6 BPM; pomysł autora: akordy z przodu, melodia tym samym brzmieniem jako uzupełnienie |
| Vela | 89,3 ms | Glitch | 11,2 Hz = trzydziestodwójki przy 84 BPM |
| Krab | 33,7 ms | Dub | ok. 30 Hz, najniższy bas; 111,1 BPM |
| PSR J0437−4715 | 5,757 ms | Liquid drum and bass | 173,7 Hz ≈ F3 −9 c; co 64. błysk = uderzenie, 162,8 BPM |
| PSR J1748−2446ad (Terzan 5) | 1,396 ms | Pozytywka (3/4) | 716 Hz |

Okresy i położenia są z pamięci modelu (literatura/ATNF). **Do zweryfikowania z katalogiem** przy etapie 2.

Pełny opis syntezy i instrumentów: `docs/DZWIEK.md` (aktualizować przy zmianach w `GENRES`). Muzyka to reguły, nie model AI: każdy gatunek w `GENRES` ma `make(B)` zwracające `{ nodes, tun, step(t, s, bar), pulse?(t) }`. Melodie to klasa `Motif` (fraza, która się powtarza i co kilka taktów mutuje), żeby było słychać melodię, a nie losowe nuty.

**Zasada autora (3.11.2026): jedne dane, jedna melodia.** Nuty i pauzy melodii są wspólne dla wszystkich gatunków (`windMelody()`) i zmieniają się przy nowym pomiarze; styl należy do gatunku.

**Zasada autora (3.11.2026): każdy pulsar to inna muzyka.** Gatunki mogą być podobne, ale zawsze coś musi być inne, poza tempem przede wszystkim instrumenty.

## Style graficzne

Przełącznik u góry ma najpierw szkice nowych kierunków z `docs/WIZUALIZACJE.md`: **Grzbiety** (domyślny), **Fale** (Słońce w środku, fale we wszystkie strony; od 8.11.2026 to dawne Rings: grube linie, których grubość wzdłuż obwodu to widmo dźwięku jak w Grzbietach, basy na dole; fala przy Słońcu żyje z muzyką, odpływając zastyga; stare cienkie Fale usunięte), **Cymatyka**, **Kolor** (kod w sekcjach „Kierunek” w `index.html`, numeracja jak w `docs/WIZUALIZACJE.md`). Potem stare style: **Bauhaus** (płaskie koła i łuki), **Oscyloskop** (jedna świecąca linia; Słońce to kształt fali dźwięku z `Tone.Waveform`). Autor: Słońce i Ziemia w wersji dosłownej były „zbyt dosłowne”; szuka abstrakcji, z której nadal wiadomo, o co chodzi. Kierunek graficzny **niezdecydowany**; obecne style autor uznał za „dość łopatologiczne”. Nowe propozycje z opisem i rekomendacją: `docs/WIZUALIZACJE.md`. Linie pola, Partytura i Kosmos usunięte na prośbę autora (2.11.2026).

Wybór pulsara: mapa całego nieba na cały ekran, prostokątna (RA 12h w środku, rośnie w lewo). Tło z danych, nie ze zdjęcia: `data/sky.js` (z d3-celestial, źródła i licencja w `data/README.md`). Autor wybrał wariant „Płaty” (7.11.2026): Droga Mleczna jako płaty w 5 odcieniach i gwiazdy do 5,8 mag. Pozostałe warianty zostają na później, do łączenia: `?dev&niebo=b` (płaty i gwiazdozbiory), `c` (kontury Drogi Mlecznej), `d` (gwiazdy w kolorach z B−V i gwiazdozbiory). Każdy pulsar miga w swoim prawdziwym rytmie (złote światło); szybkie mają drgający pierścień. **Autor nie chce listy, tylko wybór z grafiki.**

## Interfejs (projekt autora z Figmy, 8.11.2026, druga wersja wieczorem)

Ekrany wzorcowe: `docs/research/Pulsar 1600_00.png` (mapa) i `Pulsar 1600_01.png` (mapa z danymi i informacją o pulsarze); ikony z `docs/icons/*24.svg` (rysowane 18 px, biały 70%). Te pliki to materiały autora, nie commitować.
- Komputer: „Pulsar.fm” w lewym górnym rogu (klik = okienko „czym to jest”). U góry na środku pasek `#livebar` na szerokość odtwarzacza (420 px): ikona nadawania + „Live · NOAA, L1 spacecraft” po lewej, „measured 13:52” po prawej.
- Lewy dolny róg: dwa kwadraty 70 px: słoneczko (`#sunBtn`, wysuwa kafelki danych, żółte gdy włączone, wybór w `localStorage` `pfm.data`, domyślnie schowane) i oko (styl obrazu).
- Odtwarzacz na dole na środku (420×70, jak w odtwarzaczach: najpierw co gra, Play na końcu): kropka migająca z pulsarem, nazwa, „gatunek  BPM”, cztery kółka (mapa, otwiera i zamyka), jasny przycisk Play. Klik w panel pokazuje informację o pulsarze nad nim (uchwyt u góry, litery 13 px); klik w panel albo w informację ją chowa, też Esc.
- Telefon (≤640 px): przyciski słoneczka i oka w prawym górnym rogu, pasek Live pod nazwą, odtwarzacz na całą szerokość, kafelki w jednym rzędzie nad nim. Jak pokazać dane ze Słońca na telefonie: autor jeszcze nie wie.
- Kafelki: tło #C4DDFF 10% (na lekko przyciemnionej podkładce, bez rozmycia ze względu na koszt), zaokrąglenie 18 px, wartość z jednostką jednym krojem. Podpis roli w kolorze z obrazu (Bz różowy, Kp zielony).
- Informacja o pulsarze (`infoHTML()`): nazwa, jedno zdanie (`tag`), tabelka Genre/Tempo/Rotation/Key, opis (`about`), „How it plays” z `psrFacts()`. **Aplikacja startuje od mapy** (autor, 8.11.2026), po Play zostaje na mapie; wybór stylu obrazu z mapy od razu przechodzi do wizualizacji. Na mapie u góry po prawej zostaje Auto.

## Tylko prawdziwe dane

Decyzja autora (2.11.2026): słuchacz niczego nie wywołuje sam. Słuchacz ma tylko Live (decyzja autora, 8.11.2026: przełącznik Live/Replay usunięty, nagranie włącza się samo przy braku danych). U góry na środku jest pasek `#livebar`: „Live · NOAA, L1 spacecraft … measured 13:52”, przy kłopotach „Live · waiting for NOAA … last 13:52” albo „Recording · 18 Oct 2026”. Przycisk trybu z Replay 3 h zostaje pod `?dev`. Przycisk Burza, „Wywołaj rozbłysk” i suwaki działają wyłącznie pod adresem z `?dev`, do dopracowywania obrazu. Pod `?dev` są też włączniki każdej warstwy dźwięku z nazwą (pole `mix` w `make()` gatunku): używać tych nazw w rozmowie z autorem.

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
- [x] Ambient, wnioski z porównania z Brain.fm (nagranie autora): prawdziwe próbki zamiast syntezy, melodia na harfie, niska warstwa rytmiczna na kontrabasie pizzicato (marimba była za wysoka i za głośna). Autor: syntetyczne brzmienia są słabe, syntezowana niska warstwa brzmiała „jak żaba”.
- [ ] Do sprawdzenia dalej: cichy wysoki akcent, próba drżenia 18 Hz. Werbel na 2 i 4 autor odrzucił („za głośno, nie pasuje”); gra najcichszy `snare1_pppp` raz na takt, „żeby było wolno”.
- [ ] Testy słuchowe: autor słucha w Safari, więc sprawdzać też w WebKit.
- [x] Melodia z wiatru we wszystkich gatunkach. Deep i Techno zrobione: akordy z przodu, plama w tle, powtarzalna fraza z wiatru; Acid i Bas górny usunięte (autor, 3.11.2026), melodia techno na syntezatorze, nie z próbek.
- [ ] Techno, pomysły od producentów z Instagrama: trzy pasma (ciało 250 Hz–1 kHz, ugryzienie 1–4 kHz, powietrze 4 kHz+) i warstwy o różnych długościach pętli (bas 0,25 taktu, shaker 0,5, hi-hat 1, syntezator 8). Wykres orbit z tych pętli to też pomysł na obraz.
- [ ] Pomysły: strojenie zamiast przełączania pulsarów, bez odlotu z Ziemi; nazwa „wiatr dotrze za N minut”; docelowo stream.

**Następne kroki (pomysły autora, 3.11.2026)**
- [ ] Nowe style pod tempo pulsara, około 90 BPM. Pierwszy hip-hop na B1706−16 (około 92 BPM, każdy błysk to uderzenie): stopa i werbel z próbek, głęboki bas, melodia z wiatru w stylu lo-fi. Potem R&B na B1859+03 (około 91,5 BPM), wyraźnie innymi instrumentami, najlepiej z prawdziwym pianinem elektrycznym. Okresy z pamięci, do sprawdzenia w ATNF. Inni kandydaci: B0834+06, B1237+25.
- [ ] Rock i pop przy około 90 BPM: odłożone. Rock tylko, jeśli w bibliotekach CC0 są dobre gitary; pop stoi na wokalu i refrenie, których nie mamy.
- [ ] Akordy z wiatru wszędzie, ta sama zasada co melodia: wspólne akordy i ich kolejność, tempo zmian przy stylu. Autor jeszcze się zastanawia. Najpierw próba na Ambiencie, porównanie ze słuchu; ostrożnie z Ambientem i Chorałem.
- [ ] Forma utworu z danych zamiast zegara: gęstość układa warstwy, skręt Bz na południe działa jak drop.
- [ ] Deep i Geminga: klaps i hi-haty są cicho; inna perkusja i bas w każdym z nich. Szepty to imitacja, ewentualnie prawdziwe nagranie CC0.
- [ ] Dopracować Drone, Chorał, Glitch, Dub (przy 111 BPM i z melodią w basie) i Pozytywkę: wciąż stare brzmienia z syntezy.
- [ ] Liquid: autor chce porównać z ulubionymi utworami LTJ Bukema i Calibre (nagranie telefonem do `docs/`).

**Później / do rozważenia**
- [ ] Porównanie z Lyria RealTime (Google, Gemini API): model AI sterowany opisem gatunku + `bpm`, `density`, `brightness`. Możliwa hybryda: Lyria gra tło w gatunku pulsara, a pulsar i rozbłyski zostają w Tone.js. Wymaga klucza API i małego serwera.
- [ ] Wybór kierunku graficznego: szkice z `docs/WIZUALIZACJE.md` (bez usuniętych Linii pola) są w przełączniku. Autor po obejrzeniu Fal: „to jeszcze nie to”, sam jeszcze nie wie, co dalej. Autor wybiera; niewybrane style usunąć.

## Test dymny

```bash
npm i -D playwright && npx playwright install chromium
node tests/smoke.mjs
```

Sprawdza: brak błędów strony, start dźwięku, wszystkie gatunki grają (RMS > 0), rytm po zmianie stacji i po Stop/Play, ciszę po Stop, echo i strojenie, rozbłyski, awarię sieci, wznowienie dźwięku, dane bez klatek animacji; screenshoty stylów w `tests/out/`.
