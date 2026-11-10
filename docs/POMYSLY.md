# Pomysły: charakter techniczny, ekran „Signal”, nazwa

Zebrane 10.11.2026 z rozmowy z autorem. Autor przygotuje projekty w Figmie, potem wdrażamy. Szkic: `docs/research/szkic-telemetria.png` (i `.html`), plik autora, nie w repo.

## Problem

Autor: całość jest „ok, ale nie profesjonalna”. Mamy dane i je pokazujemy, ale nie czuć, że płyną z instrumentu 1,5 mln km stąd. Wygląda jak aplikacja pogodowa, a nie odbiornik telemetrii. Kierunek: rozdzielić „jak się obsługuje” (prosto, miękko) od „co się mierzy” (precyzyjnie, technicznie).

Ważne pytanie autora: skoro dane tworzą muzykę, to same wykresy nie wystarczą. Trzeba pokazać, **jak dane zamieniają się w dźwięk**.

## Pomysły

1. **Typografia danych.** Liczby krojem o stałej szerokości (`ui-monospace`, cyfry tabelaryczne), stała precyzja (np. „487.3 km/s”), małe etykiety wersalikami z odstępem (`SOLAR WIND`, `BZ · GSM`). Czas w UTC z sekundami tam, gdzie to dane, a nie interfejs.
2. **Konkretne źródło i pakiety.** W pasku Live prawdziwa nazwa sondy zamiast „L1 spacecraft”: wiersze NOAA RTSW mają pole `source` przy `active: true` (DSCOVR albo ACE). Zmiana sondy w pasku: autor akceptuje. Po prawej licznik do następnego pakietu („next 0:42” z kółkiem, które się zapełnia) zamiast „measured 13:52”; godzina pomiaru w podpowiedzi albo na ekranie Signal. Przy nowym pakiecie krótkie „packet received”.
3. **Czas przelotu wiatru.** Wiatr zmierzony na L1 dociera do Ziemi po ok. 1,5 mln km / prędkość (przy 487 km/s ok. 51 min). Jedno zdanie: „This wind reaches Earth in 51 min” z mikroschematem Słońce → L1 → Ziemia. Było już w planie jako „wiatr dotrze za N minut”.
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
