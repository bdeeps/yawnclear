// Chapter 6: yawning before birth, in babies and children, and a just-for-fun yawn counter.
// Ultrasound studies have recorded yawn-like movements in the womb from late in the first trimester.
// The foetus here is stylised and not to scale; the ultrasound panel is drawn, not a real scan.
import { THREE, M, makeHead, hud, card, clearHuds, pose, FONT, YAWN_S, clamp, lerp, sphere, tube, rng } from '../yawn.js';
import { toast } from '../ui.js';

export const FETAL_FROM = 11; // weeks after the last menstrual period; first reports put yawning at about 11 to 12 weeks
let count = 0, opened = 0;

export default {
  id: 'babies',
  short: 'Before birth',
  title: 'Yawning before you are born',
  subtitle: 'Foetuses yawn in the womb from about 11 to 12 weeks. Catching yawns comes years later.',
  view: { pos: [3.2, 1.6, 6.2], target: [0, 1.4, 0] },
  learn: `<p>Yawning starts very early. Ultrasound studies have seen yawn-like movements in the womb from about <b>11 to 12 weeks</b> of pregnancy: a slow, wide opening of the jaw, a pause, and a quicker closing, the same pattern as an adult yawn. The foetus is not breathing air, so this yawn cannot be about oxygen.</p>
    <p>Why a foetus yawns is not known. A 2012 study of 4D scans from about 24 to 36 weeks found that, as in adults, the jaw opens more slowly than it closes, and that yawning became less frequent towards 36 weeks. Newborn babies yawn often.</p>
    <p>Catching yawns comes much later. Studies suggest that <b>contagious yawning</b> usually appears around the age of <b>4 or 5</b>, and becomes more common as children grow. Babies and toddlers yawn, but they rarely catch yawns from others.</p>
    <p class="tip"><b>Try it:</b> slide through the <b>weeks of pregnancy</b> to see when yawning starts. Then the fun part: have you yawned while reading this box? Press <b>I just yawned</b> each time you do.</p>
    <p class="note">Week counts in pregnancy are usually measured from the first day of the last period. The model is not to scale, and the scan is a drawing.</p>`,
  terms: [
    { t: 'Foetus', d: 'A developing baby in the womb, from about the ninth week after conception until birth.' },
    { t: 'Ultrasound', d: 'Imaging with high-pitched sound echoes, used to watch a baby moving in the womb.' },
    { t: '4D ultrasound', d: 'Moving 3D ultrasound images, which let researchers watch a foetus open and close its mouth.' },
  ],
  defaults: { weeks: 20, play: true },
  controls: [
    { key: 'weeks', type: 'range', label: 'Weeks of pregnancy', min: 8, max: 40, step: 1, fmt: (v) => `${v} weeks` },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'yawned', type: 'buttons', label: 'Are you yawning yet?', items: [{ label: 'I just yawned', act: () => { count++; toast(count === 1 ? 'There it is. Reading about yawns is enough to set many people off.' : `That is ${count}. You are in good company.`); } }, { label: 'Reset count', act: () => { count = 0; } }] },
  ],
  quiz: [
    { q: 'From roughly when have yawns been seen on ultrasound?', options: ['From conception', 'About 11 to 12 weeks of pregnancy', 'Only after birth', 'Only at 40 weeks'], answer: 1, why: 'Ultrasound studies report yawn-like movements from late in the first trimester.' },
    { q: 'Why does foetal yawning challenge the oxygen idea?', options: ['Foetuses breathe a lot of air', 'The foetus does not breathe air yet', 'Foetuses never yawn', 'Oxygen is not in the womb'], answer: 1, why: 'A foetus gets its oxygen through the placenta, not the lungs, yet it still yawns.' },
    { q: 'When do children usually start catching yawns?', options: ['At birth', 'Around 4 or 5 years old', 'At 15', 'Never'], answer: 1, why: 'Studies suggest contagious yawning appears around 4 or 5 and grows more common with age.' },
  ],
  reel: [
    { ms: 5400, caption: 'You yawned before you were born. Ultrasound shows yawns from about 11 to 12 weeks in the womb.', set: { weeks: 14, play: true }, anim: { weeks: [12, 30] }, view: { pos: [3.2, 1.6, 6.2], target: [0, 1.4, 0] }, spin: 0.3 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.05); stage.scene.background = new THREE.Color(0x0b0d14); stage.floor.visible = false;
    opened = 0;
    const root = new THREE.Group(); root.position.y = 1.4; stage.root.add(root);
    const womb = sphere(2.2, M.clear(0xff9db0, 0.14), 48); root.add(womb);
    const fluid = sphere(2.05, M.clear(0x8ef0ff, 0.06), 40); root.add(fluid);
    const baby = new THREE.Group(); root.add(baby);
    const head = makeHead({ scale: 0.55, skin: 0xf0b8a0, hair: 0xf0b8a0, inside: false }); head.position.set(0.15, 0.55, 0.0); head.rotation.set(0.5, 0.5, 0); baby.add(head);
    const skin = M.matte(0xf0b8a0, { roughness: 0.6 });
    const body = sphere(0.6, skin, 32); body.scale.set(0.8, 1.05, 0.75); body.position.set(-0.05, -0.35, -0.1); body.rotation.z = 0.3; baby.add(body);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.55, 4, 10), skin); leg.position.set(sx * 0.22, -0.8, 0.3); leg.rotation.x = 1.3; baby.add(leg);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 4, 8), skin); arm.position.set(sx * 0.38, -0.2, 0.3); arm.rotation.set(1.2, 0, sx * 0.5); baby.add(arm);
    }
    const cord = tube([[-0.05, -0.45, 0.35], [0.4, -0.9, 0.9], [1.1, -0.6, 0.9], [1.6, 0.2, 0.4], [1.95, 0.5, -0.2]], 0.07, M.matte(0xd9a0b4, { roughness: 0.5 }), false, 80); baby.add(cord);
        let tt = 0;
    const r = rng(42), speck = Array.from({ length: 900 }, () => [r(), r(), r()]);
    const pn = hud(stage, 520, 420, (g, w, h, st, u) => st && draw(g, w, h, st, u), { wFrac: 0.34, top: 0.06 });
    const draw = (g, w, h, st, u) => {
      card(g, w, h, 'Ultrasound (a drawing)');
      const cx = w / 2, cy = 56, R1 = h - 110, a0 = Math.PI / 2 - 0.62, a1 = Math.PI / 2 + 0.62;
      g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R1, a0, a1); g.closePath(); g.fillStyle = '#060606'; g.fill(); g.clip();
      for (const [x, y, b] of speck) { const ang = lerp(a0, a1, x), rr = 20 + y * (R1 - 20); g.fillStyle = `rgba(210,210,210,${0.05 + b * 0.12})`; g.fillRect(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 2, 2); }
      // womb wall and a side view of the foetus: a big head facing right, a curled body, and a mouth that opens
      g.strokeStyle = 'rgba(220,220,220,0.45)'; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy + R1 * 0.62, R1 * 0.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
      const p = pose(u), sc = 0.55 + 0.45 * clamp((st.weeks - 8) / 32, 0, 1), hx = cx + 10 * sc, hy = cy + R1 * 0.5, HR = 52 * sc;
      const tone = (a) => `rgba(225,225,225,${a})`;
      g.fillStyle = tone(0.55); g.beginPath(); g.ellipse(hx - 70 * sc, hy + 70 * sc, 70 * sc, 52 * sc, -0.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = tone(0.75); g.beginPath(); g.arc(hx, hy, HR, 0, Math.PI * 2); g.fill();
      g.fillStyle = tone(0.75); g.beginPath(); g.ellipse(hx + HR * 0.75, hy + HR * 0.45, HR * 0.5, HR * 0.38, 0.3, 0, Math.PI * 2); g.fill();
      // the jaw drops: a dark wedge opening at the front of the face
      const open = 0.08 + p.jaw * 0.6, mx = hx + HR * 0.55, my = hy + HR * 0.55;
      g.fillStyle = '#060606'; g.beginPath(); g.moveTo(mx - HR * 0.15, my); g.arc(mx - HR * 0.15, my, HR * 0.62, -open * 0.35, open * 0.9); g.closePath(); g.fill();
      g.fillStyle = tone(0.9); g.beginPath(); g.arc(hx + HR * 0.3, hy - HR * 0.15, 4 * sc, 0, Math.PI * 2); g.fill();
      g.restore();
      g.font = FONT(20); g.fillStyle = '#c9cdd8'; g.textAlign = 'left';
      g.fillText(st.weeks < FETAL_FROM ? `${st.weeks} weeks: too early, no yawns seen yet` : p.jaw > 0.2 ? `${st.weeks} weeks: a yawn` : `${st.weeks} weeks`, 22, h - 22);
    };
    return {
      dispose() { clearHuds(); },
      update(dt, st) {
        tt += dt; opened += dt;
        const can = st.weeks >= FETAL_FROM;
        const cyc = YAWN_S + 5, u = st.play && can ? ((tt % cyc) / YAWN_S) : -1;
        const p = pose(u);
        head.set(p);
        const k = clamp((st.weeks - 8) / 32, 0, 1);
        baby.scale.setScalar(lerp(0.45, 1.45, k));
        baby.rotation.y = Math.sin(tt * 0.3) * 0.15; baby.position.y = Math.sin(tt * 0.7) * 0.05;
        pn.redraw(st, u); pn.dock();
      },
      readout(st) {
        const can = st.weeks >= FETAL_FROM, m = Math.floor(opened / 60), sec = Math.floor(opened % 60);
        return `<div class="big">${st.weeks} weeks</div><p class="r-say">${can ? 'Yawns have been recorded at this stage on ultrasound.' : 'Before about 11 weeks, yawns have not been reported.'}</p>
          <div class="row"><span>Are you yawning yet?</span><b>${count} yawn${count === 1 ? '' : 's'}</b></div>
          <div class="row"><span>Time on this page</span><b>${m}:${String(sec).padStart(2, '0')}</b></div>`;
      },
    };
  },
};
