// Chapter 3: the brain-cooling hypothesis (Gallup and Gallup, 2007) and the "thermal window".
// The idea: a deep yawn pulls in air and boosts blood flow through the skull, swapping warm blood for cooler blood.
// That only helps when the air is cooler than the body, and is hardly needed when it is very cold, so yawning
// should be most common at moderate temperatures. The window curve in the model is a sketch of that prediction,
// not fitted data; the studies compared a few seasons and temperatures, not a full curve.
import { THREE, M, makeHead, Breath, hud, card, clearHuds, pose, FONT, YAWN_S, clamp, lerp, sphere, beam } from '../yawn.js';

const BODY = 37;
const windowCurve = (T, pack) => {
  // A sketched window: rises from cold, peaks near 20 C, falls to almost nothing as air nears body temperature.
  // Returns a share of people (0..1). The floor and peak are loosely anchored to the studies (about half at
  // room temperature, about a quarter at 37 C in Arizona); the shape in between is a sketch.
  const up = 1 / (1 + Math.exp(-(T - 5) / 3.2)), down = 1 / (1 + Math.exp((T - 35) / 3));
  return clamp(0.08 + 0.44 * up * down, 0, 1) * (pack ? 0.2 : 1);
};
const C0 = new THREE.Color(0x5ec8ff), C1 = new THREE.Color(0xf4f1ea), C2 = new THREE.Color(0xff5a3c);
const tCol = (T) => { const k = clamp((T + 5) / 50, 0, 1); return k < 0.5 ? C0.clone().lerp(C1, k * 2) : C1.clone().lerp(C2, (k - 0.5) * 2); };

export default {
  id: 'cooling',
  short: 'Brain cooling',
  title: 'Does a yawn cool the brain?',
  subtitle: 'The brain-cooling idea predicts a "thermal window": most yawns when the air is mild.',
  view: { pos: [3.6, 0.6, 6.4], target: [0.2, -0.2, 0] },
  learn: `<p>The brain makes a lot of heat and works best in a narrow temperature range. In 2007 <b>Andrew Gallup and Gordon Gallup</b> proposed that yawning helps <b>cool the brain</b>. The wide stretch of the jaw boosts blood flow through the head, and the deep breath of air carries heat away, so warmer blood is swapped for cooler blood.</p>
    <p>In their study, about half of people caught yawns from videos when breathing normally. People told to breathe only through the nose, or holding a <b>cold pack to the forehead</b>, hardly yawned at all, while warm or room-temperature packs made no difference. Both should cool the head without a yawn. In rats, brain temperature rises just before a yawn and falls slightly after it.</p>
    <p>The idea makes a clear prediction, the <b>thermal window</b>. If the air is as warm as your body, a yawn cannot cool anything. If it is freezing, cooling is not needed. So yawning should peak somewhere in between. In Tucson, Arizona, 45 percent of people caught yawns in winter (about 22 °C) but only about 24 percent in early summer (about 37 °C). A later study in Vienna found catching yawns peaked at around 20 °C and dropped in freezing weather. The white dots on the chart are the Arizona results.</p>
    <p class="tip"><b>Try it:</b> drag the <b>air temperature</b> and watch the incoming air and the brain change colour. Toggle the <b>cold pack</b>.</p>
    <p class="note">The window curve is a sketch of the prediction, not measured data; the two dots are from Gallup and Eldakar (2011). The cooling idea is a leading hypothesis, but it is still debated and much of the evidence is indirect.</p>`,
  terms: [
    { t: 'Brain-cooling hypothesis', d: 'The idea that yawning helps keep the brain at its best working temperature.' },
    { t: 'Thermal window', d: 'The prediction that yawning is most common at moderate air temperatures, not very hot or very cold.' },
    { t: 'Contagious yawning', d: 'Yawning set off by seeing, hearing or thinking about someone else yawning.' },
  ],
  defaults: { temp: 20, pack: false, t: 0.2, play: true },
  controls: [
    { key: 'temp', type: 'range', label: 'Air temperature', min: -5, max: 42, step: 0.5, ends: ['freezing', 'body heat'], fmt: (v) => v.toFixed(0) + ' °C' },
    { key: 'pack', type: 'toggle', label: 'Cold pack on the forehead', hint: 'In the 2007 study this cut contagious yawning.' },
    { key: 'play', type: 'toggle', label: 'Play the yawn' },
  ],
  quiz: [
    { q: 'Why would a yawn not cool the brain on a very hot day?', options: ['The jaw cannot open', 'The air is as warm as the body, so it cannot carry heat away', 'The brain switches off', 'Hot air has no oxygen'], answer: 1, why: 'Heat flows from warm to cool. Air at body temperature has nothing to take.' },
    { q: 'What did a cold pack on the forehead do in the 2007 study?', options: ['Made people yawn more', 'Reduced contagious yawning', 'Nothing at all', 'Made people sneeze'], answer: 1, why: 'Cooling the head another way seemed to reduce the need to yawn.' },
    { q: 'Is the brain-cooling idea proven?', options: ['Yes, completely', 'It is a leading hypothesis, still debated', 'No, it was disproved', 'It only applies to dogs'], answer: 1, why: 'There is supporting evidence, but much of it is indirect, so scientists still argue about it.' },
  ],
  reel: [
    { ms: 5800, caption: 'A leading idea: yawns help cool the brain. If so, we should yawn most in mild air, not freezing or body-hot.', set: { temp: -4, pack: false, t: 0.05, play: true }, anim: { temp: [-4, 40] }, view: { pos: [3.2, 0.5, 7.0], target: [0.3, -0.4, 0] }, spin: 0 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.08); stage.scene.background = new THREE.Color(0x0b0d14); stage.floor.visible = false;
    const root = new THREE.Group(); root.position.set(-0.6, 0.3, 0); stage.root.add(root);
    const head = makeHead(); root.add(head); head.see(0.85);
    // neck with the arteries that carry blood to the brain
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.4, 24), M.clear(0xe0a989, 0.18)); neck.position.set(0, -1.5, -0.2); root.add(neck);
    const art = [-0.18, 0.18].map((x) => { const b = beam([x, -2.2, -0.3], [x * 1.3, -0.75, -0.35], 0.045, M.glow(0xff4d4d, { transparent: true, opacity: 0.9 })); root.add(b); return b; });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.12), M.plastic(0x8ef0ff, { transparent: true, opacity: 0.9 })); pack.position.set(0, 0.62, 0.92); pack.rotation.x = -0.35; root.add(pack);
    // thermometer for the room
    const th = new THREE.Group(); th.position.set(1.9, -2.3, 0.3); stage.root.add(th);
    th.add(beam([0, 0, 0], [0, 2.6, 0], 0.11, M.clear(0xffffff, 0.25)));
    const bulb = sphere(0.22, M.glow(0xff7a59), 20); th.add(bulb);
    const mercury = beam([0, 0, 0], [0, 1, 0], 0.06, M.glow(0xff7a59)); th.add(mercury);
    const lbT = label('', [0.45, 2.7, 0], th, 'hot');
    const breath = new Breath(root, 70);
    const path = [new THREE.Vector3(0, -0.8, 2.6), new THREE.Vector3(0, -0.74, 1.2), new THREE.Vector3(0, -0.66, 0.45), new THREE.Vector3(0, -0.4, 0.1), new THREE.Vector3(0, 0.15, -0.1), new THREE.Vector3(0, 0.45, -0.05)];
    let tt = 0, hold = 0;
    const pn = hud(stage, 600, 380, (g, w, h, st) => st && draw(g, w, h, st), { wFrac: 0.38, top: 0.06 });
    const draw = (g, w, h, st) => {
      card(g, w, h, 'The thermal window, sketched');
      const L = 74, R = w - 30, T = 66, B = h - 74, X = (t) => L + ((R - L) * (t + 5)) / 47, Y = (v) => B - ((B - T) * v) / 0.6;
      g.fillStyle = 'rgba(163,230,53,0.10)'; g.fillRect(X(12), T, X(27) - X(12), B - T);
      g.font = FONT(18); g.fillStyle = 'rgba(163,230,53,0.9)'; g.textAlign = 'center'; g.fillText('mild air: most yawns', (X(12) + X(27)) / 2, T + 22);
      const line = (pk, col, lw, dash) => { g.setLineDash(dash || []); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 120; i++) { const t = -5 + (47 * i) / 120, v = windowCurve(t, pk); i ? g.lineTo(X(t), Y(v)) : g.moveTo(X(t), Y(v)); } g.stroke(); g.setLineDash([]); };
      line(false, '#ff6b9a', 4); if (st.pack) line(true, '#8ef0ff', 3, [8, 6]);
      g.fillStyle = '#737a8e'; g.textAlign = 'center';
      for (const t of [0, 10, 20, 30, 37]) g.fillText(t + '°', X(t), B + 24);
      g.fillText('air temperature (°C)', (L + R) / 2, h - 18);
      g.save(); g.translate(20, (T + B) / 2); g.rotate(-Math.PI / 2); g.fillText('share who catch a yawn', 0, 0); g.restore();
      g.textAlign = 'right'; for (const q of [0, 0.2, 0.4, 0.6]) g.fillText(Math.round(q * 100) + '%', L - 4, Y(q) + 6);
      for (const [t, q] of [[21.9, 0.45], [37, 0.238]]) { g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(X(t), Y(q), 8, 0, Math.PI * 2); g.stroke(); }
      g.textAlign = 'left'; g.fillStyle = '#c9cdd8'; g.font = FONT(15); g.fillText('○ Arizona, Gallup & Eldakar 2011', L + 6, B - 8); g.font = FONT(18);
      g.strokeStyle = '#ff7a59'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(X(BODY), T); g.lineTo(X(BODY), B); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#ff7a59'; g.textAlign = 'right'; g.fillText('body', X(BODY) - 6, T + 44);
      const v = windowCurve(st.temp, st.pack);
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(st.temp), T); g.lineTo(X(st.temp), B); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(st.temp), Y(v), 9, 0, Math.PI * 2); g.fill();
    };
    return {
      dispose() { clearHuds(); },
      update(dt, st) {
        tt += dt;
        if (st.play) { if (st.t >= 1) { hold += dt; if (hold > 1.6) { st.t = 0; hold = 0; } } else st.t = Math.min(1, st.t + dt / YAWN_S); }
        const u = clamp(st.t, 0.0001, 0.9999), p = pose(u);
        head.set(p); head.rotation.x = -p.jaw * 0.18;
        const gap = Math.max(0, BODY - st.temp), cool = clamp(gap / 25, 0, 1) * (st.pack ? 0.4 : 1);
        // brain warms a little between yawns and cools during the breath in, more when the air is cooler
        const brainT = 37.3 - 0.25 * cool * p.air - (st.pack ? 0.1 : 0);
        head.brain.material.color.copy(tCol(lerp(28, 46, (brainT - 36.8) / 0.6)));
        breath.mesh.material.color.copy(tCol(st.temp));
        breath.update(tt, u < 0.6 ? 1 : u > 0.74 ? -1 : 0, path);
        art.forEach((a) => a.material.color.copy(tCol(lerp(40, 44, 1 - cool * p.air))));
        pack.visible = st.pack;
        const k = clamp((st.temp + 5) / 47, 0, 1); mercury.scale.y = 0.2 + 2.3 * k; mercury.position.y = (0.2 + 2.3 * k) / 2; mercury.material.color.copy(tCol(st.temp)); bulb.material.color.copy(tCol(st.temp));
        lbT.element.textContent = st.temp.toFixed(0) + ' °C';
        pn.redraw(st); pn.dock();
      },
      readout(st) {
        const gap = BODY - st.temp, w = windowCurve(st.temp, st.pack);
        const zone = st.temp >= 33 ? 'Too hot to cool' : st.temp <= 4 ? 'Too cold to need it' : w > 0.4 ? 'In the window' : 'Edge of the window';
        const say = st.temp >= 33 ? 'Air near body heat cannot carry heat away, so the idea predicts fewer yawns.' : st.temp <= 4 ? 'The head loses heat easily already, so the idea predicts fewer yawns.' : 'Air cooler than the body, but not freezing: the idea predicts the most yawning here.';
        return `<div class="big">${zone}</div><p class="r-say">${say}${st.pack ? ' The cold pack is cooling the head already.' : ''}</p>
          <div class="row"><span>Air is cooler than the body by</span><b>${Math.max(0, gap).toFixed(0)} °C</b></div>
          <div class="row"><span>Share catching a yawn (sketch)</span><b>about ${Math.round(w * 100)}%</b></div>`;
      },
    };
  },
};
