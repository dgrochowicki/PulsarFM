# Kierunki wizualizacji

**Stan: 1.11.2026, propozycje do porównania. Autor jeszcze nie wybrał.**

Stare style (Bauhaus, Oscyloskop oraz usunięte już Partytura i Kosmos) autor uznał za „dość łopatologiczne”: wciąż opowiadają historię „Słońce, wiatr, Ziemia”. Szukamy obrazu, który broni się sam jako grafika, a dane nadal coś w nim znaczą.

Szkice kierunków (poza usuniętymi Liniami pola) są już stylami w przełączniku, do porównania przy prawdziwej muzyce. Następny krok: autor wybiera jeden, reszta stylów znika, a wybrany dostaje dopracowanie.

## Ocena autora szkiców (2.11.2026)

- **Linie pola:** najsłabsze, wizualnie mało atrakcyjne i nie wiadomo, o co chodzi. Autorowi podoba się jednak sam ruch (cząstki płynące wzdłuż linii), warto go użyć gdzie indziej. Styl usunięty z aplikacji.
- **Kolor:** kolory fajne, ale jako tło zbyt płaskie.
- **Fale (dawne Słoje):** pomysł autora: pierścienie to promieniowanie Słońca rozchodzące się we wszystkie strony, a nie w jednym kierunku jak w Bauhausie. Obraz fal idących ze Słońca. Zapis całej nocy jako plakat wymaga teraz osobnego zapisu, bo fale opuszczają ekran.
- Po obejrzeniu Fal autor: „to jeszcze nie to”, sam jeszcze nie wie, co dalej. Szkice wypuszczone na GitHub Pages do dalszego dopracowania; kierunek jeszcze nie wybrany.

## 1. Grzbiety impulsów (faworyt)

**Co widać:** poziome linie ułożone jedna pod drugą. Każda linia to jeden takt (albo jeden obrót wolnego pulsara), a jej wybrzuszenia to kształt dźwięku w tym momencie (`Tone.Waveform` albo widmo z `Tone.FFT`). Nowe linie pojawiają się na dole, stare odpływają w górę i bledną. Linia z przodu zasłania te za nią.

**Dane:**
- wiatr słoneczny: rozmycie i drżenie linii;
- Bz: kolor (spokojny / ostrzegawczy);
- rozbłysk: nagle bardzo wysoka „góra” w jednej linii;
- pulsar: wyznacza, kiedy rysuje się nowa linia.

**Dlaczego:** tak astronomowie rysowali kolejne impulsy pierwszego odkrytego pulsara, B1919+21 (jest w aplikacji). Ten typ wykresu stał się potem kultową okładką płyty, więc jest rozpoznawalny i mógłby być znakiem rozpoznawczym Pulsar FM. **Własna wersja z własnych danych i kolorów, nie kopia okładki.**

## 2. Słoje (faworyt)

**Co widać:** każdy obrót albo takt dorysowuje jeden pierścień wokół środka, jak słoje drzewa. Obraz się kumuluje: po godzinie słuchania jest unikalnym zapisem tej nocy.

**Dane:**
- grubość i kolor pierścienia: dane z tego momentu (wiatr, Bz, Kp);
- burza albo rozbłysk: zostają w obrazie na zawsze jako wyraźny słój;
- pulsar: obrót = pierścień (naturalna jednostka).

**Dodatkowo:** zapis obrazu na koniec sesji jako plakat do zachowania i udostępnienia („twoja noc w Pulsar FM”).

## 3. Cymatyka (figury Chladniego)

**Co widać:** piasek na drgającej płytce układa się we wzory zależne od częstotliwości. Wzór wyznacza aktualny akord albo częstotliwość pulsara (np. J0437 174 Hz ma swoją figurę). Przy zmianie akordu piasek przesypuje się w nowy wzór.

**Dane:**
- gęstość wiatru: ilość piasku;
- Bz: kolor;
- prędkość wiatru: drgania piasku.

**Dlaczego:** dosłownie „dźwięk, który widać”, prawdziwe zjawisko fizyczne, w pełni abstrakcyjne. Technicznie: wzór z sumy fal stojących `cos(nπx)cos(mπy) − cos(mπx)cos(nπy)`, cząstki zsuwają się do linii węzłowych.

## 4. Linie pola magnetycznego (usunięte)

**Co widać:** bez planety i bez Słońca, tylko linie pola magnetycznego Ziemi (dipol) jako płynące krzywe. Wiatr je ściska od strony dziennej i wyciąga w ogon. Przy Bz na południe linie pękają i łączą się na nowo z błyskiem (rekoneksja, która wywołuje zorzę). Bas lekko nimi drga.

**Dlaczego:** fizycznie prawdziwe i jednocześnie abstrakcyjne. Najbliższe obecnej opowieści, ale bez dosłowności.

## 5. Pole koloru

**Co widać:** cały ekran to jeden lub dwa wolno oddychające kolory (w duchu Rothko i instalacji świetlnych Turrella). Paleta z zorzy i Bz, jasność pulsuje z pulsarem.

**Dlaczego:** idealne do słuchania w tle i na ekran blokady. Najmniej dosłowne, ale dane praktycznie znikają z pola widzenia.

## Rekomendacja

1 albo 2, ewentualnie połączenie: **grzbiety podczas słuchania, słoje jako podsumowanie sesji**. Grzbiety mają najsilniejszą historię i tożsamość, słoje dają coś, czego nie ma nikt: obraz własnej nocy do zachowania.
