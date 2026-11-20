// Chapter 2: theories and the evidence. Each idea is shown as a hypothesis with evidence for and against.
// The 3D model replays Provine's 1987 test of the oxygen idea: breathing air rich in carbon dioxide, pure oxygen,
// or exercising changes how fast you breathe, but did not change how often people yawned. The yawn timing in the
// model is a fixed, made-up interval, which is the point: it does not follow the breathing.
import { THREE, makeHead, makeChest, Breath, hud, card, clearHuds, pose, FONT, wrap, YAWN_S } from '../yawn.js';

const IDEAS = {
  oxygen: {
    name: 'More oxygen', col: '#8ef0ff',
    idea: 'Yawning tops up oxygen, or gets rid of carbon dioxide, when the blood runs low.',
    for: 'Yawns look like big breaths, and we yawn in stuffy rooms.',
    against: 'Provine and colleagues (1987) had students breathe air with extra carbon dioxide or pure oxygen, or exercise. Breathing changed a lot; yawning did not.',
    verdict: 'Not supported. It is still a popular myth.',
  },
  cooling: {
    name: 'Brain cooling', col: '#ff7a59',
    idea: 'A yawn pulls in air and boosts blood flow through the head, swapping warm blood for cooler blood.',
    for: 'Gallup and Gallup (2007): nose breathing or a cold pack on the forehead cut contagious yawning. Yawning varies with air temperature.',
    against: 'Most evidence is indirect or correlational, and some of it comes from one research group.',
    verdict: 'A leading idea, still debated. See the next chapter.',
  },
  state: {
    name: 'Changing state', col: '#c49bff',
    idea: 'Yawns help the body switch between states: waking up, winding down, or fighting off boredom.',
    for: 'People yawn most around waking and before sleep, and when bored. Many yawns come with a stretch.',
    against: 'Measurements of whether a yawn actually makes you more alert are mixed.',
    verdict: 'Plausible for when we yawn, less clear on why.',
  },
  social: {
    name: 'A social signal', col: '#ffb547',
    idea: 'Yawns, and catching them, may help a group line up its state, such as when to rest.',
    for: 'Yawns are contagious in people and some other social animals, and spread more between people who are close.',
    against: 'Animals that live alone yawn too, and so do babies in the womb, so this cannot be the only reason.',
    verdict: 'Explains catching yawns better than yawning itself.',
  },
};
const TESTS = {
  air: { name: 'Normal air', breaths: 12, note: 'Ordinary breathing, ordinary yawning.' },
  o2: { name: 'Pure oxygen', breaths: 16, note: 'Breathing sped up a little, but people still yawned as often.' },
  co2: { name: 'Air with extra CO₂', breaths: 22, note: 'Breathing sped up and deepened a lot. Yawning did not change.' },
  run: { name: 'Exercise', breaths: 24, note: 'Hard work roughly doubles breathing. Yawning did not change.' },
};
const GAP = 14; // seconds between yawns in the model, the same in every test

export default {
  id: 'theories',
  short: 'Theories',
  title: 'Why? The theories and the evidence',
  subtitle: 'Four ideas, tested. One famous one fails, and science has no settled answer yet.',
  view: { pos: [3.4, 0.0, 6.6], target: [0, -0.9, 0] },
  learn: `<p>Nobody knows for certain why we yawn. There are several <b>hypotheses</b>, ideas that can be tested, and the evidence for each is mixed. Pick one with the <b>idea</b> buttons to see its case for and against.</p>
    <p>The best-known idea, that we yawn to get <b>more oxygen</b>, has the weakest support. In 1987 the psychologist <b>Robert Provine</b> and colleagues had volunteers breathe air with extra carbon dioxide, or pure oxygen, and in another test had them exercise. Carbon dioxide at 100 times its normal level, and exercise that nearly doubled the breathing rate, made people breathe much harder, but yawning stayed about the same. Pure oxygen did not stop yawns either. Breathing and yawning seem to be run by separate programs.</p>
    <p>Other ideas are still alive. <b>Brain cooling</b> says a yawn helps cool the head. <b>Changing state</b> notes that we yawn most around waking, before sleep and when bored, as if switching gears. A <b>social</b> idea focuses on why yawns are catching. They are not mutually exclusive: yawning may do more than one job.</p>
    <p class="tip"><b>Try it:</b> under <b>Provine's test</b>, switch between air, oxygen, extra CO₂ and exercise. Watch the breathing change while the yawns keep their own rhythm.</p>
    <p class="note">The breathing rates and the gap between yawns in the model are illustrative, not the study's measured values.</p>`,
  terms: [
    { t: 'Hypothesis', d: 'A proposed explanation that can be tested, and could turn out wrong.' },
    { t: 'Carbon dioxide (CO₂)', d: 'The gas your body makes and breathes out. Too much of it makes you breathe faster.' },
    { t: 'Correlation', d: 'Two things that go up and down together. It does not prove one causes the other.' },
    { t: 'Arousal', d: 'How awake and alert the brain and body are.' },
  ],
  defaults: { idea: 'oxygen', test: 'co2', see: 1 },
  controls: [
    { key: 'idea', type: 'seg', label: 'Idea', options: Object.entries(IDEAS).map(([v, o]) => ({ v, label: o.name })), fmt: (v) => IDEAS[v].verdict.split('.')[0] },
    { key: 'test', type: 'seg', label: "Provine's test", options: Object.entries(TESTS).map(([v, o]) => ({ v, label: o.name })), fmt: (v) => TESTS[v].note },
    { key: 'see', type: 'range', label: 'See inside', min: 0, max: 1, step: 0.01, ends: ['skin', 'lungs'], fmt: (v) => (v > 0.5 ? 'cutaway' : 'solid') },
  ],
  quiz: [
    { q: 'What happened when Provine had people breathe air with extra carbon dioxide?', options: ['They yawned far more', 'They breathed harder, but yawned about as often', 'They stopped yawning', 'They fell asleep'], answer: 1, why: 'If yawns were about gas levels, extra CO₂ should have raised yawning. It raised breathing instead.' },
    { q: 'Is the "we yawn for more oxygen" idea well supported?', options: ['Yes, it is proven', 'No, experiments did not back it up', 'Only for babies', 'Only in fish'], answer: 1, why: 'Breathing pure oxygen did not stop yawns, and extra CO₂ or exercise did not increase them.' },
    { q: 'Which statement is the most honest?', options: ['Yawning is fully explained', 'There are several hypotheses and no settled answer', 'Yawning has no purpose at all', 'Yawning is only social'], answer: 1, why: 'Brain cooling, state change and social ideas all have some support, and they may work together.' },
  ],
  reel: [
    { ms: 5400, caption: 'The popular answer, more oxygen, does not hold up. In 1987, extra CO₂ made people breathe harder, not yawn more.', set: { idea: 'oxygen', test: 'co2', see: 1 }, view: { pos: [3.4, 0.0, 6.6], target: [0, -0.9, 0] }, spin: 0 },
    { ms: 5000, caption: 'Other ideas: yawns cool the brain, shift us between sleep and waking, or sync a group. None is settled.', set: { idea: 'state', test: 'air', see: 0 }, anim: { see: [0, 0.6] }, view: { pos: [-3.0, 0.2, 6.2], target: [0, -0.9, 0] }, spin: 0 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.06); stage.scene.background = new THREE.Color(0x0b0d14); stage.floor.visible = false;
    const root = new THREE.Group(); root.position.set(-0.4, 0.4, 0); stage.root.add(root);
    const head = makeHead(); root.add(head);
    const chest = makeChest(); chest.position.set(0, -2.0, -0.2); chest.scale.setScalar(0.75); root.add(chest);
    const breath = new Breath(root, 50);
    const path = [new THREE.Vector3(0, -0.15, 2.4), new THREE.Vector3(0, -0.15, 1.3), new THREE.Vector3(0, -0.1, 0.95), new THREE.Vector3(0, -0.6, 0.1), new THREE.Vector3(0, -1.4, -0.2), new THREE.Vector3(0, -2.3, -0.2)];
        let tt = 0, yawns = 0, breaths = 0, lastYawn = 0;
    const pn = hud(stage, 600, 610, (g, w, h, st) => st && draw(g, w, h, st), { wFrac: 0.36, top: 0.06 });
    const draw = (g, w, h, st) => {
      const I = IDEAS[st.idea];
      card(g, w, h, 'Hypothesis');
      g.textAlign = 'left'; g.fillStyle = I.col; g.font = FONT(34, 500); g.fillText(I.name, 22, 86);
      let y = 128;
      for (const [k, c] of [['The idea', '#eef0f6'], ['For', '#a3e635'], ['Against', '#ff7a59'], ['Verdict', I.col]]) {
        g.fillStyle = c; g.font = FONT(18, 600); g.fillText(k.toUpperCase(), 22, y); y += 27;
        g.fillStyle = '#c9cdd8'; g.font = FONT(21); y = wrap(g, I[{ 'The idea': 'idea', For: 'for', Against: 'against', Verdict: 'verdict' }[k]], 22, y, w - 44, 28) + 12;
      }
    };
    return {
      dispose() { clearHuds(); },
      update(dt, st) {
        tt += dt;
        const T = TESTS[st.test], per = 60 / T.breaths;
        // yawns every GAP seconds whatever the test
        const yu = (tt % GAP) / YAWN_S;
        const p = pose(yu < 1 ? yu : 0);
        const inYawn = yu < 1;
        if (Math.floor(tt / GAP) + 1 !== yawns) yawns = Math.floor(tt / GAP) + 1;
        breaths = Math.floor(tt / per);
        const bphase = (tt % per) / per, deep = st.test === 'co2' || st.test === 'run' ? 1.6 : 1;
        const air = inYawn ? p.air : 0.18 * deep * (0.5 - 0.5 * Math.cos(bphase * Math.PI * 2));
        head.set(p); head.see(st.see * 0.3); chest.see(st.see); chest.set(air);
        head.rotation.x = -p.jaw * 0.18;
        root.position.y = 0.4 + (st.test === 'run' ? Math.abs(Math.sin(tt * 6)) * 0.08 : 0);
        const flow = inYawn ? (yu < 0.6 ? 1 : yu > 0.74 ? -1 : 0) : (bphase < 0.5 ? 1 : -1) * 0.6 * deep;
        breath.update(tt * (inYawn ? 1 : T.breaths / 12), flow, path);
        pn.redraw(st); pn.dock();
      },
      readout(st) {
        const T = TESTS[st.test];
        return `<div class="big">${T.name}</div><p class="r-say">${T.note}</p>
          <div class="row"><span>Breathing</span><b>${T.breaths > 18 ? 'much faster and deeper' : T.breaths > 12 ? 'a little faster' : 'normal'}</b></div>
          <div class="row"><span>Yawning</span><b>about the same</b></div>
          <div class="row"><span>Breaths a minute (illustrative)</span><b>${T.breaths}</b></div>`;
      },
    };
  },
};
