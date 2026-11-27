# Pulsar FM — plan wdrożenia streamingu

Data: 27.11.2026  
Status: plan / przed implementacją

## 1. Cel i ustalenia

- Autonomiczne radio generatywne 24/7, oparte na danych NOAA i parametrach pulsarów.
- Obecna interaktywna aplikacja na GitHub Pages działa niezależnie od transmisji.
- Wspólny silnik muzyczny (Tone.js 14.8.49), osobna warstwa wizualna dla streamingu.
- Na początku niezależna generacja muzyki w WebApp i Broadcast; synchronizacja audio nie jest wymagana.
- Najpierw test na zewnętrznym VPS, bez zakupu sprzętu i bez konieczności posiadania własnego komputera.
- Pierwsza stacja: Ambient (B0329+54, ok. 84 BPM) lub Minimal techno (Geminga); wybór do potwierdzenia.
- Pierwsza platforma: YouTube; architektura od początku umożliwia Twitch i kolejne platformy.
- Monetyzacja to osobny etap, nie założony przychód.

## 2. Architektura

```text
NOAA + katalog pulsarów
          |
    wspólny kod silnika
      /             \
WebApp               Broadcast (VPS)
GitHub Pages         Chromium + Tone.js
interaktywny UI      dedykowana wizualizacja
                          |
                  obraz + audio stereo
                          |
                   FFmpeg (H.264/AAC)
                          |
                  RTMPS/RTMP fan-out
                   /            \
              YouTube          Twitch
```

Każda stacja to niezależna instancja generatora. Ten sam zakodowany strumień jednej stacji można rozesłać do kilku platform, jeśli ich wymagania są zgodne. Osobne stacje wymagają osobnego generowania i kodowania. GitHub Pages nie uruchamia procesów serwerowych.

## 3. Kolejność prac

### Etap 0 — przygotowanie i bezpieczeństwo
- [ ] Sprawdzić aktualny index.html, CLAUDE.md, docs/DZWIEK.md, audio/README.md i tests/smoke.mjs.
- [ ] Utworzyć gałąź roboczą; zachować działający main i aktualny URL aplikacji.
- [ ] Ustalić pierwszą stację i roboczą nazwę kanału; sprawdzić domenę oraz handle bezpośrednio u rejestratora i platformy. Zakup domeny nie jest wymagany do POC.
- [ ] Założyć kanał YouTube, zweryfikować konto i aktywować live z wyprzedzeniem; później konto Twitch.
- [ ] Zweryfikować bieżące wymagania transmisji, multistreamingu i zasady komercyjnego wykorzystania próbek.
- [ ] Ustalić budżet testu oraz limit czasu życia VPS.

### Etap 1 — Broadcast Mode
- [ ] Dodać tryb broadcast, np. `?broadcast&station=geminga&visual=marble` (parametry przykładowe).
- [ ] Zachować istniejące UI, zachowanie i ścieżki zasobów dla zwykłego użytkownika.
- [ ] Wykorzystać obecny silnik i katalog gatunków; nie przepisywać Tone.js na backend.
- [ ] Umożliwić wybór stałego pulsara i wizualizacji, bez geolokalizacji i interakcji widza.
- [ ] Uruchamiać muzykę automatycznie w kontrolowanej przeglądarce (Playwright, jawna konfiguracja autoplay lub kliknięcie start).
- [ ] Przygotować dedykowany layout 16:9: branding, pulsar, gatunek, BPM/Hz, podstawowe dane NOAA, oznaczenie Live/Recorded.
- [ ] Pierwszy layout prosty i wydajny; Marble jako kandydat, Canvas 2D jako wariant awaryjny bez WebGL.
- [ ] Dodać stan diagnostyczny: gotowość audio, aktualna stacja, czas ostatnich danych, heartbeat obrazu i silnika.
- [ ] Rozszerzyć testy Playwright: start, poprawna stacja, brak regresji zwykłego UI, utrata i powrót NOAA.
- [ ] Unikać dużego refaktoringu przed POC; wspólne moduły wydzielać stopniowo.

**Brama:** Broadcast uruchamia się bez ręcznej obsługi, gra i renderuje; dotychczasowe testy WebApp przechodzą.

### Etap 2 — środowisko streamingowe
- [ ] Przygotować Dockerfile i compose dla Linux x86_64: Chromium/Playwright, Xvfb, PulseAudio (lub PipeWire), FFmpeg.
- [ ] Uruchomić jedną instancję przeglądarki z wirtualnym ekranem i osobnym wirtualnym wyjściem audio.
- [ ] Przechwycić ekran przez FFmpeg (x11grab) i dźwięk z monitora wirtualnego sinka. Alternatywnie zbadać cyfrowe wyjście Web Audio; nie jest konieczne do POC.
- [ ] Test lokalnego pliku wideo na serwerze przed wysyłaniem na platformę.
- [ ] Punkt startowy: H.264, AAC stereo 48 kHz, 1080p30, klatka kluczowa co 2 s; bitrate dobrać do aktualnych wymagań platformy i wydajności. Awaryjnie 720p30.
- [ ] Klucze transmisji wyłącznie w sekretach serwera; nie w repozytorium, URL aplikacji ani logach. .env.example bez wartości.
- [ ] Dodać skrypty start/stop/status oraz logowanie z rotacją i ograniczeniem miejsca na dysku.
- [ ] Przygotować instrukcję instalacji i zarządzania przez SSH z telefonu.

**Brama:** nagranie testowe ma prawidłowy obraz i stereo, nie ma słyszalnych przerw ani istotnej desynchronizacji.

### Etap 3 — VPS i pierwszy stream
- [ ] Wynająć rozliczany godzinowo VPS (punkt startowy: 4 vCPU, 8 GB RAM, region EU, Ubuntu; konfiguracja do pomiaru, nie gwarancja wydajności).
- [ ] Zabezpieczyć SSH kluczem, firewall, aktualizacje; bez publicznych portów administracyjnych, jeśli niepotrzebne.
- [ ] Wdrożyć konkretną rewizję kodu i kontener; uruchomić testowy Broadcast.
- [ ] Sprawdzić działanie WebGL na VPS (często rendering programowy); w razie potrzeby uprościć shader, rozdzielczość lub FPS.
- [ ] Utworzyć niepubliczną transmisję YouTube i podać klucz na serwerze.
- [ ] Obejrzeć i odsłuchać stream z telefonu; skontrolować YouTube Studio.
- [ ] Test 1–2 h, następnie 24 h i 72 h po usunięciu problemów.

### Etap 4 — stabilność i pomiary
- [ ] Mierzyć CPU, RAM, swap, FPS, dropped frames, bitrate, transfer, czas restartów, stan audio oraz aktualność NOAA.
- [ ] Sprawdzić wycieki pamięci, narastanie logów i jakość dźwięku (clipping, cisza, poziomy, stereo).
- [ ] Sprawdzić utratę sieci, awarię FFmpeg/Chromium i restart całego VPS.
- [ ] Wykorzystać obecny fallback nagrania NOAA i oznaczać dane archiwalne; po powrocie sieci automatycznie wracać do live.
- [ ] Dodać watchdog i automatyczny restart z backoffem; wykrywanie ciszy nie może mylić naturalnych pauz muzycznych z awarią.
- [ ] Ustalić progi akceptacji: cel 30 FPS, brak nieplanowanych długich przerw, brak narastającego RAM, zapas CPU (roboczo 20–30%); zweryfikować pomiarami.
- [ ] Zapisać wyniki, konfigurację i koszt testu w docs/BROADCAST_TESTS.md.
- [ ] Usunąć VPS po zakończeniu testów, jeśli nie kontynuujemy; sprawdzić naliczanie kosztów dysków/IP.

### Etap 5 — multistreaming
- [ ] Dołączyć Twitch po ustabilizowaniu YouTube.
- [ ] Rozesłać wspólny H.264/AAC przez FFmpeg tee/fifo lub oddzielny relay z izolacją awarii wyjść; alternatywa: Restream.
- [ ] Uzgodnić wspólne parametry platform; jeśli niemożliwe, zastosować dodatkowe kodowanie.
- [ ] Test: awaria Twitch nie zatrzymuje YouTube i odwrotnie.
- [ ] Sprawdzić aktualne zasady jednoczesnej transmisji (w tym czatu, jakości i ewentualnych warunków partnerskich).
- [ ] Zmierzyć wzrost transferu. Orientacyjnie 1 Mb/s przez 30 dni to 324 GB danych wyjściowych, przed narzutem; pomnożyć przez liczbę wyjść i stacji.

### Etap 6 — skalowanie i decyzja o sprzęcie
- [ ] Uruchomić drugą i trzecią stację (np. Geminga i B1706−16).
- [ ] Każda instancja ma własne audio, ekran, konfigurację i klucze.
- [ ] Zmierzyć koszt zasobów per stacja; rozważyć wspólny cache NOAA.
- [ ] Porównać VPS z domowym mini PC (Intel Quick Sync) i Raspberry Pi, uwzględniając kodowanie, energię, łącze, awarie i koszt zakupu.
- [ ] Nie kupować urządzenia przed wynikami testów.
- [ ] Rozważyć panel Pulsar FM Studio, statusy, start/stop/restart i bezpieczny deployment z GitHub Actions dopiero po stabilizacji.

### Etap 7 — publiczny launch i monetyzacja
- [ ] Potwierdzić nazwę, handle i ewentualną domenę; przygotować branding, miniatury, opis kanału i link do WebApp.
- [ ] Wyjaśnić autorski charakter generacji, źródła danych, instrumenty oraz różnicę między danymi live a fallbackiem.
- [ ] Zweryfikować licencje każdej próbki, wizualizacji i źródła danych oraz zachować dokumentację pochodzenia.
- [ ] Uruchomić publiczną stację i mierzyć średnich słuchaczy, retencję, obserwujących, przejścia do WebApp.
- [ ] Zweryfikować aktualne progi YPP i Twitch Affiliate w panelach platform. Próg nie gwarantuje akceptacji ani przychodów.
- [ ] Zweryfikować reguły kwalifikujących się godzin oglądania i archiwizacji YouTube; rozważyć publiczne segmenty krótsze niż 12 h, jeśli pomaga to zachować VOD. Nie zakładać, że niearchiwizowany stream 24/7 naliczy godziny do YPP.
- [ ] Ocenić wpływ reklam na doświadczenie muzyczne; dopiero potem rozważyć dodatkowe modele (wsparcie, premium, licencje).
- [ ] Ustalić koszt operacyjny vs rzeczywiste przychody, bez zakładania stałego RPM.

## 4. Proponowana struktura (ewolucyjna)

- `index.html` — obecna aplikacja, zachować adres i kompatybilność.
- `broadcast/` — dedykowany widok lub moduły prezentacyjne.
- `core/` — przyszłe wspólne moduły muzyki i danych; wydzielać po testach.
- `infra/` — Dockerfile, compose, skrypty uruchomienia i konfiguracja.
- `tests/` — testy WebApp i Broadcast.
- `docs/BROADCAST.md` — ten plan.
- `docs/BROADCAST_TESTS.md` — przyszłe wyniki testów.

## 5. Definicja ukończenia POC

Jedna stacja gra przez 24 h na VPS i jest dostępna na niepublicznym YouTube, bez własnego komputera. Działa dedykowana oprawa, dźwięk stereo, aktualizacja NOAA i recovery po awarii. Znamy faktyczne zużycie zasobów i koszt. Obecna aplikacja działa bez regresji. Dopiero wtedy podejmujemy decyzję o publicznym starcie, kolejnych stacjach i sprzęcie.

## 6. Otwarte decyzje

- Pierwsza stacja i ostateczny styl wizualny.
- Nazwa marki, domena i handle.
- Dostawca VPS, finalna rozdzielczość i bitrate.
- Sposób multistreamingu oraz archiwizacji.
- Docelowy model monetyzacji.

Wszystkie powyższe parametry infrastruktury są założeniami do testów, nie wynikami pomiarów. Nie zmieniamy na tym etapie działającego silnika muzycznego ani nie kupujemy sprzętu.
