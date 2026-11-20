// Chapter 1: anatomy of a yawn. A stylised head, neck and chest go through one yawn: a long, deep inhale with the
// jaw opening wide, a short peak with the face stretched and the eyes shut, then a quicker exhale.
// A typical yawn lasts about 6 seconds; published averages for adults vary, roughly 4 to 7 seconds.
import { THREE, M, makeHead, makeChest, Breath, hud, card, clearHuds, pose, phaseAt, PHASES, FONT, YAWN_S, smooth } from '../yawn.js';

export default {
  id: 'anatomy',
  short: 'Anatomy',
  title: 'Anatomy of a yawn',
  subtitle: 'A wide jaw, a long deep breath in, a stretch, and a quick breath out, in about six seconds.',
  view: { pos: [2.6, 0.2, 5.0], target: [0, -0.5, 0] },
  learn: `<p>A yawn is not just a big breath. It is a fixed sequence that runs the same way almost every time, which is why it is hard to stop once it has started. Scientists call this kind of reflex a <b>fixed action pattern</b>.</p>
    <p>First the jaw drops <b>wide</b> and you take a <b>long, slow, deep breath in</b>. Your throat and the space at the back of your mouth open up, and your chest fills more than in an ordinary breath. Then comes a short <b>peak</b> (sometimes called the acme): the muscles of the face and neck tense, the eyes squeeze shut or narrow, and many people stretch. Last, a <b>quicker breath out</b> as the jaw closes.</p>
    <p>At the peak, the tubes that link the middle ears to the throat (the <b>Eustachian tubes</b>) open, which is why your ears can pop as the pressure evens out. X-ray studies in the 1950s found the throat widens to about four times its resting size, and the heart rate rises briefly.</p>
    <p class="tip"><b>Try it:</b> scrub the <b>yawn</b> slider through the three phases, or let it play. Turn on <b>see inside</b> to watch the air go in and the lungs fill.</p>
    <p class="note">The timing is approximate. A typical adult yawn lasts about 6 seconds on average (published averages range from about 6 to 7 seconds), and single yawns can be as short as about 3.5 seconds.</p>`,
  terms: [
    { t: 'Yawn', d: 'An involuntary wide opening of the mouth with a long, deep breath in, a brief peak, and a shorter breath out.' },
    { t: 'Fixed action pattern', d: 'A built-in sequence of movements that, once triggered, usually runs to the end.' },
    { t: 'Acme', d: 'The peak of a yawn, when the jaw is widest and the face muscles are most stretched.' },
    { t: 'Eustachian tube', d: 'The narrow tube linking the middle ear to the back of the throat. Yawning and swallowing can open it.' },
  ],
  defaults: { t: 0.3, play: true, see: 0 },
  controls: [
    { key: 't', type: 'range', label: 'The yawn', min: 0, max: 1, step: 0.002, fmt: (v) => (v * YAWN_S).toFixed(1) + ' s of about 6' },
    { key: 'play', type: 'toggle', label: 'Play the yawn' },
    { key: 'see', type: 'range', label: 'See inside', min: 0, max: 1, step: 0.01, ends: ['skin', 'airway and lungs'], fmt: (v) => (v > 0.5 ? 'cutaway' : 'solid') },
  ],
  quiz: [
    { q: 'Which part of a yawn usually lasts longest?', options: ['The breath out', 'The long breath in', 'The peak', 'They are all equal'], answer: 1, why: 'The slow, deep inhale with the jaw opening takes most of the yawn. The peak is brief and the breath out is quicker.' },
    { q: 'About how long does a typical adult yawn last?', options: ['Half a second', 'About 6 seconds', 'About a minute', 'Ten minutes'], answer: 1, why: 'About 6 seconds is the commonly published average, though single yawns vary.' },
    { q: 'Why can your ears pop during a yawn?', options: ['The eardrum tears', 'The Eustachian tubes open and the pressure evens out', 'Blood stops flowing to the ears', 'Your brain switches hearing off'], answer: 1, why: 'A yawn opens the tubes between the middle ears and the throat, letting the pressure on each side of the eardrum even out.' },
  ],
  reel: [
    { ms: 5200, caption: 'Why do we yawn? First, what a yawn actually is: about six seconds, in three parts.', set: { t: 0, play: false, see: 0 }, anim: { t: [0, 0.45] }, view: { pos: [3.4, 1.0, 5.4], target: [0, -0.3, 0] }, spin: 0 },
    { ms: 5400, caption: 'A long deep breath in, a stretched peak with the eyes shut, then a quick breath out.', set: { t: 0.45, play: false, see: 0.2 }, anim: { t: [0.45, 1], see: [0.2, 0.85] }, view: { pos: [4.2, 0.6, 4.2], target: [0, -0.6, 0] }, spin: 0 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.1); stage.scene.background = new THREE.Color(0x0b0d14); stage.floor.visible = false;
    const root = new THREE.Group(); root.position.y = 0.6; stage.root.add(root);
    const head = makeHead({ scale: 1 }); root.add(head);
    const chest = makeChest(); chest.position.set(0, -2.0, -0.2); chest.scale.setScalar(0.75); root.add(chest);
    const breath = new Breath(root, 70);
    const path = [new THREE.Vector3(0, -0.8, 2.6), new THREE.Vector3(0, -0.74, 1.2), new THREE.Vector3(0, -0.66, 0.45), new THREE.Vector3(0, -0.9, -0.1), new THREE.Vector3(0, -1.4, -0.2), new THREE.Vector3(0, -2.3, -0.2)];
    const lbEar = label('Ear tube opens', [0.95, 0.05, -0.05], root, 'hot');
    const lbLung = label('Lungs', [0.95, -2.0, 0], root);
    const lbJaw = label('Jaw', [0.5, -1.25, 0.6], root);
    let tt = 0, hold = 0;
    const pn = hud(stage, 560, 300, (g, w, h, st) => st && draw(g, w, h, st), { wFrac: 0.38, top: 0.075 });
    const draw = (g, w, h, st) => {
      card(g, w, h, 'One yawn, about 6 seconds');
      const L = 30, R = w - 30, T = 70, B = h - 64, X = (u) => L + (R - L) * u, Y = (v) => B - (B - T) * v;
      g.font = FONT(19);
      for (const p of PHASES) { g.fillStyle = p.color + '22'; g.fillRect(X(p.from), T, X(p.to) - X(p.from), B - T); g.fillStyle = p.color; g.textAlign = 'left'; g.fillText(p.name, X(p.from) + 6, T + 22); }
      const curve = (key, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 160; i++) { const u = i / 160, v = pose(Math.min(0.9999, Math.max(0.0001, u)))[key]; i ? g.lineTo(X(u), Y(v * 0.8)) : g.moveTo(X(u), Y(v * 0.8)); } g.stroke(); };
      curve('air', '#8ef0ff', 4); curve('jaw', '#ff6b9a', 3); curve('eyes', '#ffb547', 2);
      g.textAlign = 'left'; g.font = FONT(18);
      [['air in the lungs', '#8ef0ff'], ['jaw opening', '#ff6b9a'], ['eyes shut', '#ffb547']].forEach(([n, c], i) => { g.fillStyle = c; const sp = (w - 2 * L) / 3; g.fillRect(L + i * sp, h - 34, 16, 6); g.fillStyle = '#a8aebf'; g.fillText(n, L + 22 + i * sp, h - 26); });
      g.fillStyle = '#737a8e'; g.textAlign = 'right'; g.fillText('0 s', X(0) + 26, B + 22); g.fillText('~6 s', X(1), B + 22);
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(st.t), T); g.lineTo(X(st.t), B); g.stroke();
    };
    return {
      dispose() { clearHuds(); },
      update(dt, st) {
        tt += dt;
        if (st.play) { if (st.t >= 1) { hold += dt; if (hold > 1.4) { st.t = 0; hold = 0; } } else st.t = Math.min(1, st.t + dt / YAWN_S); }
        const u = Math.min(0.9999, Math.max(0.0001, st.t)), p = pose(u);
        head.set(p); head.see(st.see); chest.set(p.air);
        chest.see(st.see);
        head.rotation.x = -p.jaw * 0.18 + Math.sin(tt * 0.6) * 0.01;
        const ph = phaseAt(u);
        const flow = ph?.name === 'Inhale' ? smooth(u / 0.15) : ph?.name === 'Exhale' ? -1 : 0;
        breath.mesh.visible = st.see > 0.05 || flow !== 0;
        breath.update(tt, flow * (0.4 + 0.6 * p.jaw), path);
        lbEar.element.style.opacity = p.ear > 0.3 ? 1 : 0.45;
        lbLung.element.style.opacity = st.see > 0.3 ? 1 : 0;
        lbJaw.element.style.opacity = 0.8;
        pn.redraw(st); pn.dock();
      },
      readout(st) {
        const u = Math.min(0.9999, Math.max(0.0001, st.t)), ph = phaseAt(u), p = pose(u);
        const say = { Inhale: 'Jaw dropping, a long slow breath in. The throat opens wide.', Peak: 'The peak: face stretched, eyes shut, Eustachian tubes open so ears may pop.', Exhale: 'A quicker breath out as the jaw closes. Done.' }[ph.name];
        return `<div class="big" style="color:${ph.color}">${ph.name}</div><p class="r-say">${say}</p>
          <div class="row"><span>Time into the yawn</span><b>${(u * YAWN_S).toFixed(1)} s</b></div>
          <div class="row"><span>Jaw opening</span><b>${Math.round(p.jaw * 100)}%</b></div>
          <div class="row"><span>Extra air in the lungs</span><b>${Math.round(p.air * 100)}% of the peak</b></div>`;
      },
    };
  },
};
