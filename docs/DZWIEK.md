# Jak powstaje dźwięk w Pulsar FM

**W skrócie:** każdy dźwięk jest syntezowany na żywo w przeglądarce, przez Web Audio API i bibliotekę Tone.js. Nie ma nagrań, sampli ani modelu AI. Przeglądarka liczy falę dźwiękową matematycznie, w czasie rzeczywistym, z kilku prostych klocków. To, *co* grają te klocki, decydują reguły kompozycji napisane w kodzie, a dane z kosmosu przestawiają ich parametry.

## 1. Klocki, z których składa się każdy dźwięk

| Klocek | Co to jest | Przykład w aplikacji |
|---|---|---|
| **Oscylator** | generator czystej fali o danej częstotliwości: sinus (gładki), piła (jasna, „brzęcząca”), prostokąt (pusty, „8-bitowy”), trójkąt (miękki) | bas w techno i dubie (sinus), plamy syntezatora (piła) |
| **Oscylator „fat”** | kilka lekko rozstrojonych oscylatorów naraz; daje szeroki, chóralny dźwięk | pad w ambiencie, chór, akord „braam” |
| **Oscylator z harmonicznymi** | własna mieszanka tonu podstawowego i alikwotów | organy w chorale (7 harmonicznych) |
| **Ciąg impulsów** | wąskie impulsy o zadanej częstotliwości | **sam pulsar**: Vela, Krab, J0437 i Terzan 5 grają swoją prawdziwą częstotliwością obrotu |
| **Synteza FM** | jeden oscylator moduluje częstotliwość drugiego; daje metaliczne, dzwonkowe i szklane barwy | pozytywka, piknięcia w glitchu, gong w drone |
| **Membrana** | sinus z gwałtownie opadającą wysokością | stopa w techno, kotły w chorale, trailerowe „buuum” |
| **Szum** | biały (ostry) albo różowy (głębszy) | hi-hat, klaps, trzaski, wiatr w drone, „szum” przy rozbłysku X |
| **Obwiednia** | kształt głośności w czasie: atak, opadanie, podtrzymanie, wybrzmienie | ta sama piła z długim atakiem to plama, z krótkim to stab |

## 2. Obróbka (efekty)

| Efekt | Do czego |
|---|---|
| **Filtr** (dolno-, górno-, pasmowoprzepustowy) | jasność dźwięku. Główne „pokrętło” sterowane prędkością wiatru. Filtr pasmowy imituje samogłoskę w chórze. |
| **Pogłos** (9 s) | przestrzeń, wspólna dla wszystkiego |
| **Echo** (delay) | powtórzenia; w dubie bardzo długie, z dużym sprzężeniem |
| **Przester** | brud: glitch, akord „braam” przy rozbłysku |
| **Nasycenie** (Chebyshev) | dodaje harmoniczne do basu w techno, żeby był słyszalny na małych głośnikach |
| **Chorus, vibrato** | drżenie i szerokość: poświata Kp, szklana harmonijka, chór |
| **LFO** | powolna, ciągła zmiana parametru, np. filtra w drone |
| **Limiter** | na samym końcu, żeby nic nie przesterowało |

Droga sygnału: instrumenty gatunku → (echo / filtr / przester) → pogłos → limiter → głośnik.

## 3. Kompozycja: kto decyduje, co zagrać

- **Zegar.** Tone.js odlicza szesnastki w tempie wyznaczonym przez pulsar. W każdej szesnastce gatunek decyduje, co zagrać (`step(t, s, bar)` w `GENRES`).
- **Puls pulsara.** Przy wolnych pulsarach osobny zegar uderza dokładnie co okres pulsara (np. co 0,7145 s) i gra stopę, gong, kocioł albo hi-hat, zależnie od gatunku.
- **Głośność warstw oceniać na wyjściu.** Pomiar przy źródle myli: nie widać filtrów, pogłosu i echa ani czułości ucha. Mierzyć każdą warstwę solo na `A.master`, z ważeniem A i przez pełny cykl filtra (Deep i Minimal techno 3.11.2026: stopa około -46 dB, tło około -60 dB).
- **Akordy z wiatru (Deep, Minimal techno).** Co 4 takty akord: średnia z kolejnych 4 z ostatnich 16 minut wybiera stopień z `WIND_CHORDS`, od ciemnego do jasnego. Za akordem idzie plama i bas.
- **Harmonia.** Każdy gatunek ma dwie skale (jasną i mroczną) i krótki ciąg akordów zapisany jako stopnie skali. Akordy buduje się z tercji.
- **Melodia.** Klasa `Motif`: krótka fraza (8–16 kroków), która się powtarza, a co kilka taktów zmienia jedną nutę. Co kilkanaście taktów powstaje nowa fraza. Dzięki temu słychać melodię, a nie losowe nuty.
- **Rytm.** Wzory perkusyjne to tablice „gra / nie gra” na 16 kroków, losowane od nowa co kilka taktów.
- **Forma.** W techno co 16 taktów są 2 takty bez stopy (oddech przed nową frazą).
- **Strojenie.** Przy szybkich pulsarach cały utwór jest transponowany do nuty najbliższej częstotliwości pulsara i dostrajany w centach. Np. J0437 (173,7 Hz) to F3 o 9 centów niżej, więc cała muzyka jest o 9 centów niżej niż czyste F.

## 4. Instrumenty w każdym gatunku

### Pulsary, tempo i styl

Styl to prawdziwy rodzaj muzyki, do którego dany gatunek ma się zbliżać, z hasłem i przykładami do researchu. Przykłady są z pamięci, do sprawdzenia przy słuchaniu.

| Pulsar | Gatunek | Tempo | Skąd tempo | Tonacja | Styl | Czego szukać |
|---|---|---|---|---|---|---|
| J2144−3933 | Drone | 112,8 BPM | 16 uderzeń na błysk | D, stała | drone, dark ambient | Stars of the Lid, Éliane Radigue |
| B1919+21 | Chorał | 89,7 BPM | 2 uderzenia na błysk | D, stała | sakralny ambient, muzyka chóralna | Arvo Pärt, Hildegarda z Bingen |
| B0329+54 | Ambient | 84,0 BPM | co błysk | D, stała | ambient, muzyka do skupienia | Brian Eno, Brain.fm |
| Geminga | Minimal techno | 126,5 BPM | co 2. błysk | D, stała | melodyjne techno, Berlin i Detroit | Robert Hood, Galeria Kaskada (nagranie autora) |
| B0950+08 | Deep | 118,5 BPM | co 2. błysk | D, stała | dub techno, deep techno | Basic Channel, Deepchord |
| Vela | Glitch | 84,0 BPM | co 8. błysk | F | glitch, IDM | Autechre, Alva Noto |
| Krab | Dub | 71,1 BPM | co 25. błysk | B | dub, roots reggae | King Tubby, Rhythm & Sound |
| J0437−4715 | Liquid | 173,7 BPM | co 60. błysk | F | liquid drum and bass, jungle | LTJ Bukem (łamany bit, melodyczne tło, wyraźny, melodyczny bas), Calibre |
| J1748−2446ad (Terzan 5) | Pozytywka | 95,5 BPM | co 450. błysk | F | pozytywka, kołysanka, walc 3/4 | Yann Tiersen, „music box” |

### Instrumenty

| Gatunek (pulsar) | Instrumenty |
|---|---|
| **Drone** (J2144) | dwa długie, grube oscylatory (piła + sinus) przez wolno ruchomy filtr; różowy szum jak wiatr; gong FM co 8,5 s; rzadkie dzwony |
| **Chorał** (B1919+21) | organy (oscylator z harmonicznymi), chór (gruba piła przez vibrato i filtr samogłoski), kotły (membrana) |
| **Ambient** (B0329+54) | plama z grubych oscylatorów o barwie z wiatru (16 ostatnich minut to głośności 16 alikwotów, nowa barwa przy zmianie akordu; akord trwa 4 takty, około 11 s, i ma 6 dźwięków), basowy sinus, melodia na próbkach harfy przez echo (16 ostatnich minut wiatru, pomiar na ósemkę: wysokość z prędkości, nuta tylko przy zmianie od 4 km/s na minutę, mniej przy dużej gęstości), niska warstwa rytmiczna na próbkach kontrabasu pizzicato (krótkie nuty akordu na ćwierćnuty, między nimi przy zmianie wiatru), najcichszy werbel raz na takt, miękka, długo wybrzmiewająca stopa na każdy błysk |
| **Minimal techno** (Geminga) | stopa (membrana), hi-hat = błyski pulsara (biały szum), otwarty hi-hat, klaps (szum przez filtr pasmowy), bas: głęboki sinus idący za akordem, długie płynące akordy z grubej piły jako tło (przenikają się, filtr otwiera się co 8 taktów), cicha melodia z wiatru na organach (kilka harmonicznych, krótko), szepty: szum przez wąski filtr przez 4 takty po skoku wiatru od 5 km/s na minutę (imitacja, nie głos). Wzór: nagranie „Galeria Kaskada”. Usunięte 3.11.2026 na prośbę autora: Acid (piła, Q 12, poślizg 0,04, przester 0,55) i Bas górny (cicha piła nad sinusem) |
| **Deep** (B0950+08) | perkusja i bas jak w Minimal techno, ale głośne krótkie akordy z prostokątów, cicha plama jako tło, melodia brzmieniem akordów z nutami na miejscach największych zmian wiatru (4–7 nut w dwóch taktach, zależnie od gęstości), otwarty hi-hat na stałe |
| **Glitch** (Vela) | pulsar jako ciąg impulsów 11 Hz, trzaski z białego szumu przez przester (czasem „zacięte”), piknięcia FM, sub-stopa, ziarnisty pad |
| **Dub** (Krab) | pulsar jako ciąg impulsów 30 Hz, głęboki bas (sinus), akordy z prostokątów na słabą część taktu w długim echu, stopa i rimshot na trzy |
| **Liquid drum and bass** (J0437) | co 60. błysk to uderzenie, 173,7 BPM. Rytm z próbek: stopa prosta i cicha, łamie się werbel (spóźniony co drugi takt, między mocnymi uderzeniami ciche), hi-hat, otwarty hi-hat, shaker. Łagodny, melodyczny bas na wzór autora „buum buum bum bum bum buum” (nisko, około F1, wysokości z wiatru), chór z grubych sinusów jako tło z akordami z wiatru co 8 taktów, tło melodyczne idące po dźwiękach akordu, szklana harmonijka (sinus z vibrato, wiele głosów, nuty wybrzmiewają) z melodią z wiatru na ćwierćnutach, pulsar 173,7 Hz tylko krótkim błyskiem co 4 takty |
| **Pozytywka** (Terzan 5) | pozytywka FM (lekko nierówna w czasie, jak mechanizm), walczyk z trójkątów, pulsar 716 Hz |

**Warstwy wspólne dla wszystkich gatunków:** niski bas, który rośnie przy Bz na południe; wysoka poświata przy Kp ≥ 4; trailerowe uderzenie przy rozbłysku (membrana opadająca z wysokości + przesterowany akord „braam” z otwierającym się filtrem).

## 5. Co dane z kosmosu zmieniają w dźwięku

| Dane | Zmiana |
|---|---|
| Prędkość wiatru | otwarcie filtrów (jaśniej), wysokość motywów, długość echa, jasność melodii w techno |
| Gęstość wiatru | jak często grają nuty motywu, dodatkowe warstwy rytmu, sprzężenie echa w dubie |
| Bz < −2 nT | mroczna skala (na początku taktu), wspólny niski bas |
| Kp | wysoka poświata nad akordami, druga linia szklanej harmonijki |
| Rozbłysk C / M / X | bęben wielki (uderzenie, po 2 s pocieranie) i „buuum” / + „braam” / pełny „braam” z tercją + szum |

Zmiany są celowo wygładzane, więc przy spokojnym Słońcu są subtelne. Żeby je usłyszeć, użyj trybu „Burza” albo suwaków „Steruj ręcznie”.

## 6. Ograniczenia i możliwe kierunki

- Instrumenty „akustyczne” (organy, chór, pozytywka) brzmią syntetycznie, bo syntezą trudno je udać. Rozwiązanie: `Tone.Sampler` z darmowymi samplami (np. chór, celesta). Jedyny wyjątek od zasady „bez nagrań”, do decyzji autora.
- Zmiany z danych mogłyby być słyszalne wyraźniej: przejście przy zmianie nastroju, „podmuch” przy skoku prędkości wiatru, zmiana instrumentu prowadzącego przy wysokim Kp.
- Alternatywa: model AI Lyria RealTime jako tło (opis w `CLAUDE.md`, sekcja „Później”).
