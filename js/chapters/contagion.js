// Chapter 4: contagious yawning. One person yawns and the yawn spreads around a room.
// This is a toy model: each time someone sees a yawn they catch it with a small chance, larger when the people
// in the room are close to each other. The chances are made up to give a realistic-looking spread. Real studies
// report that roughly 40 to 60 percent of adults yawn while watching others yawn, and that yawns spread more
// between family and friends than between strangers.
import { THREE, M, makePerson, hud, card, clearHuds, pose, FONT, YAWN_S, clamp, lerp, rng, beam } from '../yawn.js';

const N = 12, R = 3.3, ROUND = 42;
const SKINS = [0x8d5524, 0xc68642, 0xe0ac69, 0xf1c27d, 0xffdbac, 0x5c3a21, 0xa86b4c, 0xd9a06b, 0x7a4a2a, 0xeac39b, 0xb07a52, 0x6b4226];
const SHIRTS = [0x5b7bd8, 0xff6b9a, 0xa3e635, 0xffb547, 0x8ef0ff, 0xc49bff, 0xff7a59, 0x4fd1a5, 0xf5d76e, 0x7aa2ff, 0xe58fdc, 0x9aa5b8];
const HAIR = [0x1d1410, 0x3b2416, 0x0f0b09, 0x6b4a2b, 0x2a1d14, 0x101010, 0x8a6a3f, 0x1a1a1a, 0x4a2f1b, 0xb08a5a, 0x22160f, 0x0d0d0d];
const LEVELS = [[0, 'Strangers'], [0.33, 'Acquaintances'], [0.66, 'Friends'], [1, 'Family']];
const levelName = (c) => LEVELS.reduce((a, b) => (Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a))[1];
const chance = (c) => lerp(0.05, 0.2, c); // per yawn seen, toy values

function simulate(close, seed) {
  const r = rng(seed * 7919 + Math.round(close * 100)), q = chance(close);
  const when = Array(N).fill(Infinity), from = Array(N).fill(-1), done = Array(N).fill(false);
  when[0] = 0.6;
  for (;;) {
    let j = -1; for (let i = 0; i < N; i++) if (!done[i] && when[i] < Infinity && (j < 0 || when[i] < when[j])) j = i;
    if (j < 0) break; done[j] = true;
    for (let i = 0; i < N; i++) {
      if (done[i]) continue;
      const roll = r(), delay = 1.6 + r() * 4.5;
      if (roll < q && when[j] + delay < when[i] && when[j] + delay < ROUND - YAWN_S) { when[i] = when[j] + delay; from[i] = j; }
    }
  }
  return { when, from };
}

export default {
  id: 'contagion',
  short: 'Catching yawns',
  title: 'Why yawns are catching',
  subtitle: 'Seeing, hearing or even reading about a yawn can set one off, more so from people close to you.',
  view: { pos: [0, 7.5, 9.5], target: [0, 0.6, 0] },
  learn: `<p>Yawns spread. Watching someone yawn, <b>hearing</b> one, or even <b>reading about</b> yawning can trigger your own. This is called <b>contagious yawning</b>. In lab studies where adults watch videos of people yawning, roughly <b>40 to 60 percent</b> yawn at least once, depending on the study and how long they watch (one large 2014 study found about two thirds). Robert Provine found that reading about yawning for five minutes made 30 percent of people yawn, against 11 percent reading about hiccups.</p>
    <p>Who yawns matters. Field studies by <b>Ivan Norscia and Elisabetta Palagi</b> in Italy found yawns spread most between <b>family</b>, then <b>friends</b>, then acquaintances, and least between <b>strangers</b>. Similar familiarity effects have been reported in chimpanzees, bonobos and dogs.</p>
    <p>Many scientists link this to <b>empathy</b> or social closeness, but the link is <b>debated</b>. A large 2014 study of 328 people found that age (older people caught fewer yawns) predicted contagion better than empathy scores. Early studies reported less contagious yawning in autistic children, but later work found the gap mostly disappeared when children were guided to look at the yawning face, so it may reflect where people look rather than how much they care.</p>
    <p class="tip"><b>Try it:</b> set who is in the room with the <b>closeness</b> slider, then press <b>start a new yawn</b>. Watch the yawn jump from person to person.</p>
    <p class="note">The room is a toy model with made-up chances. It shows the idea of a familiarity gradient, not measured rates.</p>`,
  terms: [
    { t: 'Contagious yawning', d: 'Yawning triggered by seeing, hearing, reading or thinking about someone else yawning.' },
    { t: 'Spontaneous yawning', d: 'Yawning with no outside trigger, for example when tired or bored.' },
    { t: 'Familiarity bias', d: 'Yawns spread more easily between people who know each other well.' },
    { t: 'Empathy', d: 'Sharing or understanding what someone else feels. Its link to catching yawns is debated.' },
  ],
  defaults: { close: 0.66, seed: 1 },
  controls: [
    { key: 'close', type: 'range', label: 'Who is in the room', min: 0, max: 1, step: 0.01, ends: ['strangers', 'family'], fmt: (v) => levelName(v) },
    { key: 'go', type: 'buttons', label: 'Run it again', items: [{ label: 'Start a new yawn', act: (s, inst) => { s.seed = (s.seed % 97) + 1; inst.restart?.(); } }] },
  ],
  quiz: [
    { q: 'Roughly what share of adults catch a yawn when watching others yawn in studies?', options: ['Almost none', 'About 40 to 60 percent', 'Everyone', 'Exactly 10 percent'], answer: 1, why: 'Studies differ, but a common range is about 40 to 60 percent.' },
    { q: 'Whose yawns are you most likely to catch?', options: ['Strangers', 'Family and close friends', 'People on TV only', 'It makes no difference'], answer: 1, why: 'Field studies found a familiarity gradient: family, then friends, then acquaintances, then strangers.' },
    { q: 'Is contagious yawning proven to measure empathy?', options: ['Yes, it is a reliable empathy test', 'No, the link is debated and other factors like age and attention matter', 'Yes, but only in adults', 'It is unrelated to anything social'], answer: 1, why: 'Some studies find a link, but large studies point to age and attention too. It is not an empathy test.' },
  ],
  reel: [
    { ms: 5600, caption: 'Yawns are catching. Seeing, hearing, even reading about one can set you off. Are you yawning yet?', set: { close: 0.7, seed: 3 }, act: (s, inst) => inst.restart?.(), view: { pos: [0, 7.5, 9.5], target: [0, 0.6, 0] }, spin: 0.6 },
    { ms: 5200, caption: 'Roughly 40 to 60 percent of adults catch one in studies, and most often from family and friends.', set: { close: 1, seed: 5 }, act: (s, inst) => inst.restart?.(), view: { pos: [6, 4.5, 6.5], target: [0, 1, 0] }, spin: 0.4 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.05); stage.scene.background = new THREE.Color(0x0b0d14);
    const people = [], links = [];
    const rug = new THREE.Mesh(new THREE.CircleGeometry(R + 1, 64), M.matte(0x1b2030)); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; rug.receiveShadow = true; stage.root.add(rug);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, p = makePerson(SHIRTS[i], SKINS[i], HAIR[i]);
      p.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); p.lookAt(0, 0, 0);
      stage.root.add(p); people.push(p);
      const ln = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 6), M.glow(0xff6b9a, { transparent: true, opacity: 0 })); ln.visible = false; stage.root.add(ln); links.push(ln);
    }
    const first = label('First yawn', [0, 2.3, 0], people[0], 'hot');
    let tt = 0, sim = simulate(s.close, s.seed), key = '';
    const pn = hud(stage, 520, 270, (g, w, h, st) => st && draw(g, w, h, st), { wFrac: 0.32, top: 0.06 });
    const draw = (g, w, h, st) => {
      card(g, w, h, 'Yawns so far in this room');
      const caught = sim.when.filter((t) => t <= tt).length;
      g.font = FONT(64, 500); g.fillStyle = '#ff6b9a'; g.textAlign = 'left'; g.fillText(`${caught} of ${N}`, 22, 124);
      g.font = FONT(22); g.fillStyle = '#c9cdd8'; g.fillText(levelName(st.close) + ' in the room', 22, 170);
      const L = 22, Rr = w - 22, y = 220;
      for (let i = 0; i < N; i++) { const x = L + ((Rr - L) * (i + 0.5)) / N, on = sim.when[i] <= tt; g.fillStyle = on ? '#ff6b9a' : 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill(); }
      g.font = FONT(17); g.fillStyle = '#737a8e'; g.fillText('a toy model with made-up chances', 22, h - 20);
    };
    const restart = () => { tt = 0; sim = simulate(s.close, s.seed); key = ''; };
    const place = (ln, a, b) => {
      const A = a.clone(), B = b.clone(), len = A.distanceTo(B);
      ln.position.copy(A).add(B).multiplyScalar(0.5); ln.scale.set(1, len, 1);
      ln.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize());
    };
    return {
      restart,
      dispose() { clearHuds(); },
      update(dt, st) {
        const k = st.close.toFixed(2) + '|' + st.seed;
        if (k !== key) { if (key) restart(); key = k; }
        tt += dt; if (tt > ROUND) restart(), (key = k);
        for (let i = 0; i < N; i++) {
          const u = (tt - sim.when[i]) / YAWN_S;
          people[i].set(pose(u));
          const ln = links[i], j = sim.from[i];
          const show = j >= 0 && tt > sim.when[i] - 2.5 && tt < sim.when[i] + 2;
          ln.visible = show;
          if (show) {
            const a = people[j].position.clone().setY(1.7), b = people[i].position.clone().setY(1.7);
            place(ln, a, b); ln.material.opacity = 0.85 * clamp(1 - Math.abs(tt - sim.when[i] + 0.5) / 2.5, 0, 1);
          }
        }
        first.element.style.opacity = tt < 8 ? 1 : 0;
        pn.redraw(st); pn.dock();
      },
      readout(st) {
        const caught = sim.when.filter((t) => t <= tt).length;
        return `<div class="big">${levelName(st.close)}</div>
          <div class="row"><span>People who have yawned</span><b>${caught} of ${N}</b></div>
          <div class="row"><span>Chance to catch each yawn seen (toy)</span><b>${Math.round(chance(st.close) * 100)}%</b></div>`;
      },
    };
  },
};
