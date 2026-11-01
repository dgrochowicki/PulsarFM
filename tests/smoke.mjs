// Test dymny: strona bez błędów, dźwięk startuje, każdy gatunek gra, rytm i Stop działają, screenshoty stylów.
// Uruchomienie: node tests/smoke.mjs (wymaga: npm i -D playwright && npx playwright install chromium)
import pw from "playwright";
const { chromium } = pw;
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "tests", "out");
mkdirSync(out, { recursive: true });

const server = createServer(async (req, res) => {
  try {
    const path = join(root, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
    res.writeHead(200, { "content-type": path.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
}).listen(4174);

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto("http://localhost:4174/");
await page.waitForTimeout(6000);
console.log("status:", await page.textContent("#status"));
await page.click("#psrBtn");
await page.evaluate(() => Object.defineProperty(navigator, "geolocation", {
  configurable: true,
  value: { getCurrentPosition(success, error) { error({ code: 1, PERMISSION_DENIED: 1 }); } },
}));
await page.click("#autoPulsar");
const autoSelection = await page.evaluate(() => ({
  enabled: document.querySelector("#autoPulsar").getAttribute("aria-pressed") === "true",
  fallback: document.querySelector("#autoStatus").textContent.includes("Używam Szczecina."),
  selected: psr === highestPulsarAboveHorizon(DEFAULT_LOCATION)?.pulsar,
}));
if (!autoSelection.enabled || !autoSelection.fallback || !autoSelection.selected) {
  throw new Error("Automatyczny wybór pulsara nie działa z lokalizacją zastępczą.");
}
await page.evaluate(() => {
  const p = PULSARS.find((item) => item !== psr);
  const point = aitoff(p.ra, p.dec), rect = sky.getBoundingClientRect();
  sky.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: rect.left + point.x, clientY: rect.top + point.y }));
});
const manualSelection = await page.evaluate(() => document.querySelector("#autoPulsar").getAttribute("aria-pressed") === "false");
if (!manualSelection) throw new Error("Ręczny wybór pulsara nie wyłącza trybu automatycznego.");
await page.click("#sheetClose");
await page.click("#play");

const rms = () => page.evaluate(async () => {
  let s = 0, n = 0;
  for (let k = 0; k < 15; k++) { for (const v of A.wave.getValue()) { s += v * v; n++; } await new Promise((r) => setTimeout(r, 100)); }
  return Math.sqrt(s / n);
});

let failed = false;
for (const id of ["B0329", "B1919", "J2144", "Geminga", "Vela", "Crab", "J0437", "Ter5"]) {
  await page.evaluate((id) => selectPulsar(PULSARS.find((p) => p.id === id)), id);
  await page.waitForTimeout(4000);
  const r = await rms();
  const label = await page.evaluate(() => G.label);
  console.log(`${id.padEnd(8)} ${label.padEnd(16)} RMS ${r.toFixed(4)}`);
  if (!(r > 0.003)) failed = true;
}

// Pierwszy impuls po akcji; po ~45 s grania opóźnienie z przeliczania czasu byłoby już wyraźne.
const firstPulseAfter = (action) => page.evaluate(async (action) => {
  window.pulseTimes = [];
  const t0 = performance.now();
  new Function(action)();
  while (!window.pulseTimes.length && performance.now() - t0 < 5000) await new Promise((r) => setTimeout(r, 20));
  return (performance.now() - t0) / 1000;
}, action);
const check = (ok, text) => { console.log(`${ok ? "ok  " : "BŁĄD"} ${text}`); if (!ok) failed = true; };

await page.evaluate(() => {
  const original = onPulse;
  window.onPulse = (t) => { window.pulseTimes?.push(t); original(t); };
  selectPulsar(PULSARS.find((p) => p.id === "B0329"));
});
await page.waitForTimeout(500);
const afterSwitch = await firstPulseAfter(`selectPulsar(PULSARS.find((p) => p.id === "Geminga"))`);
check(afterSwitch < 1, `impuls po zmianie stacji: ${afterSwitch.toFixed(2)} s`);

await page.click("#play");
await page.waitForTimeout(500);
const afterRestart = await firstPulseAfter(`document.querySelector("#play").click()`);
check(afterRestart < 1, `impuls po Stop i Play: ${afterRestart.toFixed(2)} s`);

const timing = await page.evaluate(async () => {
  selectPulsar(PULSARS.find((p) => p.id === "B0329"));
  selectPulsar(PULSARS.find((p) => p.id === "Crab"));
  await new Promise((r) => setTimeout(r, 500));
  return { eighth: Tone.Time("8n.").toSeconds(), shared: A.delay.delayTime.value, dub: G.inst.nodes[0].delayTime.value };
});
check(Math.abs(timing.shared - timing.eighth) < 0.01 && Math.abs(timing.dub - timing.eighth) < 0.01, `echo w tempie: ${timing.shared.toFixed(3)} i ${timing.dub.toFixed(3)} s, ma być ${timing.eighth.toFixed(3)} s`);

const tune = await page.evaluate(() => ({ drone: A.drone.frequency.value, root: Tone.Frequency(E.m(0, -3), "midi").toFrequency() }));
check(Math.abs(tune.drone - tune.root) < 0.01, `bas z Bz w tonacji: ${tune.drone.toFixed(2)} Hz`);
const geminga = await page.evaluate(() => bpmFor(PULSARS.find((p) => p.id === "Geminga")));
check(Math.abs(geminga - 126.5) < 0.5, `tempo Gemingi: ${geminga.toFixed(1)} BPM`);

const flares = await page.evaluate(() => {
  const rows = (...fluxes) => fluxes.map(([flux, h], i) => ({ flux, time_tag: new Date(Date.UTC(2026, 10, 1, 12) + (h ?? i / 60) * 3600000).toISOString() }));
  const B = 3e-7, C = 2e-6, M = 2e-5, A1 = 5e-8;
  const seen = [], original = triggerFlare;
  window.triggerFlare = (level) => seen.push(level);
  xrayTag = null;
  const feed = { wind: 400, dens: 4, bz: 1, kp: 2, xray: C, flareLevel: 2 };
  applyLive({ ...feed, xrayTag: "t0" });
  applyLive({ ...feed, xrayTag: "t1" });
  applyLive({ ...feed, xrayTag: "t1" });
  window.triggerFlare = original;
  return {
    rise: newFlareLevel(rows([B], [C])), fromA: newFlareLevel(rows([A1], [C])), background: newFlareLevel(rows([C], [C])),
    secondMSoon: newFlareLevel(rows([M, 0], [B, 1], [M, 2])), secondMLater: newFlareLevel(rows([M, 0], [B, 2], [M, 4])),
    applied: seen,
  };
});
check(JSON.stringify(flares) === JSON.stringify({ rise: 2, fromA: 2, background: 0, secondMSoon: 0, secondMLater: 3, applied: [2] }), `rozbłyski: ${JSON.stringify(flares)}`);

const offline = await page.evaluate(async () => {
  const realFetch = window.fetch, saved = { ...target };
  lastLive ??= { wind: 450, dens: 3, bz: 1, kp: 2, time: new Date() };
  target.wind = lastLive.wind;
  window.fetch = () => Promise.reject(new Error("brak sieci"));
  await enterMode("live");
  await new Promise((r) => setTimeout(r, 1500));
  const result = { kept: target.wind === lastLive.wind, status: document.querySelector("#status").textContent };
  window.fetch = realFetch; Object.assign(target, saved);
  return result;
});
check(offline.kept && offline.status.includes("Brak nowych danych"), `awaria sieci: ${offline.status}`);

const race = await page.evaluate(async () => {
  enterMode("live");
  await enterMode("storm");
  await new Promise((r) => setTimeout(r, 3000));
  return { mode, wind: target.wind };
});
check(race.mode === "storm" && race.wind === 780, `Burza w czasie pobierania: ${JSON.stringify(race)}`);

const resumed = await page.evaluate(async () => {
  await Tone.context.rawContext.suspend();
  dispatchEvent(new Event("pointerdown"));
  await new Promise((r) => setTimeout(r, 300));
  return Tone.context.state;
});
check(resumed === "running", `wznowienie dźwięku: ${resumed}`);

// Glitch z zacięciem na każdym kroku: powtórzone trzaski nie mogą wchodzić na następny krok.
const glitchErrors = errors.length;
await page.evaluate(() => {
  window.realRandom = Math.random;
  Math.random = () => 0.01;
  selectPulsar(PULSARS.find((p) => p.id === "Vela"));
});
await page.waitForTimeout(3000);
await page.evaluate(() => { Math.random = window.realRandom; });
check(errors.length === glitchErrors, "zacięcia w Glitchu bez błędów");

// Po Stop ma być cisza, także przy mocnym Bz i po wybraniu gatunku z ciągłymi oscylatorami.
await page.click("#play");
await page.evaluate(() => { mode = "manual"; target.bz = cur.bz = -15; selectPulsar(PULSARS.find((p) => p.id === "J2144")); });
await page.waitForTimeout(6000);
const silence = await rms();
check(silence < 0.001, `cisza po Stop: RMS ${silence.toFixed(5)}`);
await page.click("#play");

for (const st of ["bauhaus", "scope", "score", "space"]) {
  await page.click(`[data-style=${st}]`);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(out, `${st}.png`) });
}

// Dane mają płynąć do muzyki także bez klatek, czyli w ukrytej karcie.
const hidden = await page.evaluate(async () => {
  window.requestAnimationFrame = () => 0;
  await new Promise((r) => setTimeout(r, 200));
  cur.wind = 300; target.wind = 800; mode = "manual";
  await new Promise((r) => setTimeout(r, 2000));
  return cur.wind;
});
check(hidden > 500, `dane bez klatek animacji: wiatr ${Math.round(hidden)} km/s`);

console.log(errors.length ? "Błędy:\n" + errors.join("\n") : "Bez błędów strony.");
await browser.close();
server.close();
process.exit(failed || errors.some((e) => !/Failed to load resource/.test(e)) ? 1 : 0);
