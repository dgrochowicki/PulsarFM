# Pomysły: charakter techniczny, ekran „Signal”, nazwa

Zebrane 10.11.2026 z rozmowy z autorem. Autor przygotuje projekty w Figmie, potem wdrażamy. Szkic: `docs/research/szkic-telemetria.png` (i `.html`), plik autora, nie w repo.

## Problem

Autor: całość jest „ok, ale nie profesjonalna”. Mamy dane i je pokazujemy, ale nie czuć, że płyną z instrumentu 1,5 mln km stąd. Wygląda jak aplikacja pogodowa, a nie odbiornik telemetrii. Kierunek: rozdzielić „jak się obsługuje” (prosto, miękko) od „co się mierzy” (precyzyjnie, technicznie).

Ważne pytanie autora: skoro dane tworzą muzykę, to same wykresy nie wystarczą. Trzeba pokazać, **jak dane zamieniają się w dźwięk**.

## Pomysły

1. **Typografia danych.** Liczby krojem o stałej szerokości (`ui-monospace`, cyfry tabelaryczne), stała precyzja (np. „487.3 km/s”), małe etykiety wersalikami z odstępem (`SOLAR WIND`, `BZ · GSM`). Czas w UTC z sekundami tam, gdzie to dane, a nie interfejs.
2. **Konkretne źródło i pakiety.** W pasku Live prawdziwa nazwa sondy zamiast „L1 spacecraft”: wiersze NOAA RTSW mają pole `source` przy `active: true` (DSCOVR albo ACE). Zmiana sondy w pasku: autor akceptuje. Po prawej licznik do następnego pakietu („next 0:42” z kółkiem, które się zapełnia) zamiast „measured 13:52”; godzina pomiaru w podpowiedzi albo na ekranie Signal. Przy nowym pakiecie krótkie „packet received”.
3. **Czas przelotu wiatru.** Wiatr zmierzony na L1 dociera do Ziemi po ok. 1,5 mln km / prędkość (przy 487 km/s ok. 51 min). Jedno zdanie: „This wind reaches Earth in 51 min” z mikroschematem Słońce → L1 → Ziemia. Było już w planie jako „wiatr dotrze za N minut”. **Wniosek z 15.11.2026: kontekst, nie dźwięk**, patrz sekcja „Czas przelotu wiatru: co naprawdę znaczy”.
4. **Historia przy wartościach.** Wykres ostatnich minut/godzin. Same wykresy autor uznał za mniej potrzebne niż pokazanie zamiany w muzykę (patrz ekran Signal).
5. **Mapa jak atlas.** Podziałka RA/Dec na brzegach, dane katalogowe pulsara (okres, DM, odległość, rok odkrycia), w trybie Auto współrzędne słuchacza i czas gwiazdowy.

## Ekran „Signal” (trzecia scena obok mapy i obrazu)

Osobny ekran, nie okienko: na telefonie nie ma miejsca na więcej w kafelkach. Autor chce też zrobić osobny ekran (nie okienko) do wyboru wizualizacji; zaprojektuje to później.

Zawartość (szkic B):
- Na górze droga wiatru: Słońce, L1 (1,5 mln km), Ziemia, punkt „now” i czas przelotu.
- Każda dana w swoim rzędzie, z tym, co z niej powstaje w dźwięku:
  - **wiatr**: wykres ostatnich 16 minut; kropki to nuty melodii, które z niego wychodzą; pod spodem nazwy nut (`windMelody()`, `windDegrees()`);
  - **gęstość**: 16 kratek rytmu, które grają;
  - **Bz**: wskaźnik wokół zera, „dark · low bass on” albo „bright”;
  - **Kp**: pasek z progiem 4 (wysokie tony);
  - **rozbłysk (GOES)**: klasa i „trailer boom” przy nowym od C.

Chwila nowego pakietu (szkic C): wykres przesuwa się o minutę, nowa nuta wchodzi na końcu frazy z żółtą obwódką, licznik wraca do 1:00. Pod spodem krótko, co pakiet zmienia.

Jak to działa w kodzie (stan 10.11.2026), żeby opis był prawdziwy:
- melodia to 16 ostatnich minut wiatru; nowy pomiar przesuwa okno o minutę (najstarsza nuta wypada, nowa dochodzi), zakres wysokości przelicza się od nowa, więc fraza czasem lekko się przestawia;
- filtry, gęstość, skala i bas płyną do nowych wartości w ok. 1 s (`stepData()`), bez skoku;
- rozbłysk gra tylko przy nowym rozbłysku od klasy C.

Słuchacz słyszy, że muzyka powoli się zmienia, ale nie wie, kiedy przyszedł pakiet: ekran Signal ma to pokazać.

### Pięciolinia (pomysł autora, 10.11.2026)

Wykres wiatru po kliknięciu (albo małą ikoną) zamienia się w pięciolinię z nutami melodii. To najkrótsza droga do pokazania „wiatr → nuty”.
- Animacja przejścia: kropki z wykresu zjeżdżają na swoje miejsca na pięciolinii, linia wykresu gaśnie, wchodzą linie.
- Nuty są równe (ósemki), więc nie trzeba biblioteki do zapisu nutowego: pięć linii, główki nut, laski, pauzy tam, gdzie `windMelody()` daje `null`.
- Tonacja: dla szybkich pulsarów transpozycja z `musicFor()`; skala ciemna przy Bz < −2 nT da znaki przykluczowe, co samo w sobie pokazuje wpływ Bz.
- Przy nowym pakiecie pięciolinia przesuwa się o nutę jak taśma.

## Głośność

Ustalone 10.11.2026: suwak głośności niepotrzebny (telefon ma przyciski, komputer głośność systemu). Do zrobienia: **wyrównać głośność gatunków** (dziś RMS od 0,022 w Pozytywce do 0,135 w Liquid, ok. 15 dB różnicy) i dać łagodny limiter na wyjście na rozbłyski. Ewentualnie na komputerze przycisk wyciszenia albo klawisz M.

## Nazwa i domena

pulsar.fm i pulsarfm.com są zajęte. Sprawdzone whois 10.11.2026 (do potwierdzenia ceny i dostępności u rejestratora; .fm kosztuje zwykle ok. 80–100 USD rocznie):

| Domena | Whois | Uwagi |
|---|---|---|
| pulsars.fm | wolna | faworyt: marka zostaje, liczba mnoga pasuje (każdy pulsar to stacja) |
| pulsar.radio | wolna | drugi wybór |
| solarwind.fm, starwind.fm, spaceweather.fm, neutronstar.fm | wolne | |
| lighthouse.fm | wolna | pulsar to „latarnia” kosmosu |
| pulsefm.space | wolna | |
| skyradio.fm | wolna | odpuścić: Sky Radio to istniejąca stacja |
| pulsar.fm, pulsarfm.com, pulsarradio.com, pulsar.audio, pulsar.live | zajęte | |

## Instrumenty stacji: co z czego gra (pomysł autora, 10.11.2026)

Słuchacz ma wiedzieć, który instrument gra z której danej. Dwa miejsca, ta sama treść:
- **Informacja o pulsarze** (`infoHTML()`): sekcja „Instruments”, krótka lista instrument → dana, np. w Ambiencie: harfa ← wiatr (melodia), kontrabas pizzicato ← gęstość (rytm), pad ← wiatr (barwa), bas ← Bz, wysokie tony ← Kp, bęben wielki i „buuum” ← rozbłysk. Pulsar: tempo (i w szybkich tonacja).
- **Ekran Signal**: w każdym rzędzie danych nazwa instrumentu grającej teraz stacji („→ Melody · harp”). Rząd mógłby lekko błysnąć, gdy ten instrument naprawdę zagra nutę, żeby związek był widoczny, a nie tylko opisany.

Źródło w kodzie: każdy gatunek ma już nazwane warstwy w polu `mix` w `make()` (np. Ambient: Pad, Harfa, Kontrabas, Bit, Bas, Werbel). Wystarczy dopisać do nich daną sterującą i angielską nazwę dla słuchacza.

## Czy wiatr to najlepsze źródło melodii (rozmowa 10.11.2026)

Wniosek: wiatr zostaje. Jest ciągły (co minutę), gładki, ma wyraźne trendy i jest najpewniejszy (DSCOVR, zapasowo ACE). Słabość: w spokojne dni prawie płaski, co łagodzi minimalny zakres w `windDegrees()` i nuta tylko przy wyraźnej zmianie.

Inne dane, które biorą udział albo mogłyby:
- **Bz**: zmienia się szybko i zmienia znak, ruchliwy, ale szarpany; dziś skala i bas. Ewentualnie druga głos/kontrapunkt, ale wbrew zasadzie „jedna dana, jedna rola”.
- **Gęstość**: zbyt kolczasta na melodię, dobra do rytmu (tak jest).
- **Strumień rentgenowski GOES**: gładka krzywa dobowa, wolna; dobra na długą formę (np. jasność, napięcie utworu), nie na melodię.
- **Kp**: co 3 godziny, za wolny.
- **Monitory neutronów** (promienie kosmiczne): prawie płaskie, ułamki procenta; faktura/szum (etap 3).
- **Magnetometry** (GOES, stacje naziemne): bogate falowanie, rośnie przy burzy; kandydat na drugi głos albo na tempo/puls magnetosfery (patrz niżej).

## Co oprócz pulsarów mogłoby dawać tempo (rozmowa 10.11.2026)

Wniosek: pulsary zostają sercem (jedyne naturalne metronomy, tempo z błysków to prawda). Ewentualnie wyjątkowe stacje na mapie:
1. **Słońce**: drgania powierzchni z okresem ok. 5 minut (helioseizmologia), podwajane do tempa jak pulsary. „Rytm z gwiazd, melodia ze Słońca”. Najlepiej pasuje do opowieści.
2. **Drgania magnetosfery** (pulsacje Pc3–Pc5, od kilkunastu sekund do kilku minut): jedyne tempo zmieniające się na żywo z pogodą kosmiczną; trudne dane, dalszy etap.
3. Księżyce Jowisza 1:2:4, TRAPPIST-1: gotowe polirytmy, ale już wykorzystywane muzycznie.
4. Gwiazdy pulsujące (cefeidy, RR Lyrae): okresy godzin i dni, mniej dokładne.
5. Prędkość wiatru jako tempo: odrzucone, tempo pływałoby i rozjeżdżało się z błyskami pulsara.

Podobne projekty (dla nazwy i pozycji): CRaTER Radio (NASA/UNH, muzyka z promieniowania przy Księżycu), „Space Weather – The Musical” (blog S. Elvidge'a, 2026). Nikt nie łączy pulsarów jako stacji z pogodą kosmiczną na żywo.

## Czas przelotu wiatru: co naprawdę znaczy (rozmowa 15.11.2026)

**Dla muzyki nic nie zmienia.** Żaden dźwięk od niego nie zależy. Mówi tylko, że muzyka gra z wiatru, który jeszcze nie dotarł do Ziemi (sonda na L1 mierzy go ok. 50 minut wcześniej). Nasza muzyka miesza dwa czasy: wiatr i Bz to pomiar przed Ziemią (to, co nadchodzi), Kp to stan przy Ziemi (skutek wiatru sprzed ok. godziny, liczony co 3 godziny).

Odrzucone: granie tego czasu, np. repryza melodii po 51 minutach, gdy ten wiatr dociera do Ziemi. Nikt nie zapamięta frazy sprzed godziny, więc byłby to efekt tylko na papierze.

**Pytanie autora: skoro co minutę przychodzi nowa paczka, to co pokazywać?** Autor ma rację, że jedna liczba („za 51 min”) jest myląca. Każda minuta pomiaru to osobna porcja wiatru. W każdej chwili między L1 a Ziemią leci ok. 50 takich porcji, a do Ziemi właśnie dociera ta zmierzona ok. 50 minut temu. Liczba „51 min” dotyczy tylko najnowszej porcji i prawie się nie zmienia (zależy tylko od prędkości), więc co minutę pokazywałaby to samo.

Uczciwe możliwości:
1. **Stałe zdanie o zjawisku**, nie o paczce: „Solar wind takes about 50 minutes to travel from the spacecraft to Earth.” Do okienka „czym to jest” albo na ekran Signal. Najprostsze i zawsze prawdziwe.
2. **Taśma porcji w drodze** (tylko na ekranie Signal): ostatnie ok. 60 minut pomiarów (mamy je z NOAA) ułożone nie według czasu, ale według drogi: przy L1 najnowsza porcja, przy Ziemi ta, która właśnie dociera. Każda porcja leci ze swoją prędkością (czas = 1,5 mln km / jej prędkość), więc szybsze doganiają wolniejsze; tak naprawdę powstają fronty uderzeniowe. Melodia gra z 16 najnowszych porcji, czyli z pierwszej części taśmy. To obraz prawdziwy fizycznie, ale nadal kontekst, nie dźwięk.

Wniosek: nie na ekran główny. Jeśli w ogóle, to wariant 1 (zdanie) albo wariant 2 na ekranie Signal. Wykres z jednym punktem „now” i jedną liczbą (szkic B) odrzucony. Praktyczny sens „za ile dotrze” ma w Aurora Now (kiedy wyjść patrzeć na zorzę), ewentualnie przy połączeniu projektów.

## Co jeszcze mierzy SOLAR-1 (rozmowa 15.11.2026)

Od 2026 NOAA bierze dane z sondy **SOLAR-1** (dawniej SWFO-L1). Wszystko publiczne przychodzi w plikach, które już pobieramy (`rtsw_wind_1m.json`, `rtsw_mag_1m.json`), plus obrazy koronografu. Czujnik szybkich cząstek (STIS) nie ma na razie publicznego pliku.

Nieużywane dziś pola i pomysły (autor: „wszystkie pomysły są super”):
1. **By (pole w bok), kąty pola → stereo. Wdrożone 16.11.2026** (sam By, głos melodii; opis w `docs/DZWIEK.md`). Pole obraca się w lewo i w prawo, dźwięk przesuwa się między głośnikami. Rola „przestrzeń” jest wolna. Polecane jako pierwsze: prosty dodatek do każdego gatunku, słychać od razu na słuchawkach.
2. **Bt (całkowita siła pola) → napięcie albo pogłos.** Bz mówi o kierunku, Bt o sile; skacze przy nadejściu wyrzutu masy (CME).
3. **Temperatura protonów (`proton_temperature`) → nuty drugiej warstwy albo tła (pomysł autora).** Uwaga: temperatura rośnie razem z prędkością, więc wprost dublowałaby melodię z wiatru. Ciekawsze jest odchylenie od temperatury oczekiwanej dla danej prędkości (zależność empiryczna, np. Lopez 1987, T rośnie mniej więcej z kwadratem prędkości): wiatr za zimny jak na swoją prędkość to typowy znak CME. Wtedy druga warstwa mówiłaby coś nowego, a nie powtarzała wiatr. Do sprawdzenia ze słuchu.
4. **Koronograf CCOR-2 (obrazy korony Słońca, co 15 minut). Odrzucony** (autor, 15.11.2026: „do niczego nam nie jest potrzebny”). Zostawione dla pamięci: Przykłady w `docs/research/ccor2-solar1-20261115_2045.jpg` (zwykły, „White Light”) i `...-roznicowy.jpg` („Running Difference”, różnica z obrazem sprzed 15 min, na nim widać ruch, np. wyrzuty). Adresy: `services.swpc.noaa.gov/images/animations/ccor2/latest.jpg` i `.../ccor2-diff/latest.jpg`; NOAA pozwala je wczytać z naszej strony (CORS `*`). Na obrazach są napisy i logo NOAA wtopione w piksele, do przycięcia; przesłona ma kształt kropli z ramieniem u góry.

Odrzucone: kierunek przepływu (vx, vy, vz, zmienia się minimalnie), położenie sondy (orbita wokół L1, bez znaczenia dla muzyki).

## Pomysły na gatunki (rozmowa 19.11.2026)

Autor: dodajemy w wolnej chwili, lista otwarta. Zasada: tempo z samych błysków, bez mnożenia ani dzielenia; poniżej 80/min `tempoFloor`. Każdy gatunek wyraźnie innymi instrumentami (zajęte: pianino i wibrafon w hip-hopie, smyczki i klawesyn w trip-hopie, kalimba i flet w downtempo, harfa i kontrabas w Ambiencie, trąbka w Krabie).

| Gatunek | Pulsar | Błyski/min | Pomysł | Dane |
|---|---|---|---|---|
| Dub | B0820+02 | 69,4 | stary kod Dubu na start: echo, sprężyna, bas z przodu; orbita z białym karłem (ok. 3,4 roku) jako bardzo wolne falowanie | ATNF 2.6.0, orbita do sprawdzenia |
| R&B | B1859+03 | 91,5 | pianino elektryczne FM z VCSL (TX81Z), miękki bas, klaśnięcie | ATNF 2.6.0 |
| Jungle / drum and bass | B2020+28 (0,3434 s) | ok. 174,7 | ciemniejszy brat Liquidu: cięte breaki, ciężki bas Reese; zapas: B1933+16 (0,3587 s, ok. 167) | z pamięci |
| House / garage | B0823+26 (0,5307 s) | ok. 113 | stopa na każdy błysk, organy albo akordy stab, jasny | z pamięci |
| Reggaeton / dancehall | B2016+28 (0,5580 s) | ok. 107,5 | rytm dembow, marimba albo steel drum | z pamięci |
| Modern classical / drugi Drone | B1237+25 (1,3824 s), B0834+06 (1,2738 s) | ok. 43 i 47 | za wolne na bit: pianino i smyczki w pogłosie, błysk jako pojedynczy dźwięk | z pamięci |

„Z pamięci” znaczy: sprawdzić okres, położenie i odległość w ATNF przed budowaniem (19.11.2026 katalog nie odpowiadał).
