// Chapter 5: yawning across the animal world. Mammals, birds, reptiles and fish have all been seen to yawn.
// The chart re-plots species means of yawn duration against brain weight from the CC0 dataset of
// Massen J.J.M. et al. (2021), Communications Biology 4:503 (DataverseNL doi:10.34894/9HENTF). The means were
// computed from the per-yawn records in that file; some species have only a handful of yawns.
// Gallup et al. (2016, Biology Letters) first reported the link in 19 mammal taxa; its figure is not copied.
import { THREE, M, hud, card, clearHuds, pose, FONT, clamp, lerp } from '../yawn.js';
import { makeQuad, makePrimate, makeBird, makeFish } from '../animals.js';

// [name, mean yawn s, brain g, kind] (kind: m mammal, b bird)
const DATA = [
  ['Orangutan', 8.82, 363, 'm'], ['Hippopotamus', 8.47, 589, 'm'], ['Human', 7.33, 1330, 'm'], ['Bactrian camel', 6.66, 601, 'm'],
  ['Lion', 5.42, 236, 'm'], ['Gibbon', 4.99, 95.6, 'm'], ['Chimpanzee', 4.98, 371, 'm'], ['Walrus', 4.91, 1036, 'm'], ['Brown bear', 4.91, 353, 'm'],
  ['Dromedary', 4.89, 602, 'm'], ['Bonobo', 4.76, 336, 'm'], ['Gorilla', 4.64, 438, 'm'], ['Tiger', 4.62, 271, 'm'], ['Giant panda', 4.24, 256, 'm'],
  ['Elephant seal', 4.2, 1069, 'm'], ['Polar bear', 4.15, 490, 'm'], ['Jaguar', 4.13, 152, 'm'], ['Long-tailed macaque', 3.69, 66.4, 'm'],
  ['Raccoon', 3.66, 42, 'm'], ['Wolf', 3.15, 138, 'm'], ['Goat', 3.09, 120, 'm'], ['Cheetah', 2.88, 114, 'm'], ['Sheep', 2.79, 115.5, 'm'],
  ['Capybara', 2.62, 77.8, 'm'], ['Koala', 2.45, 21.4, 'm'], ['Opossum', 2.27, 6.87, 'm'], ['Golden hamster', 2.23, 1.1, 'm'],
  ['Marmoset', 1.92, 7.67, 'm'], ['Guinea pig', 1.82, 3.6, 'm'], ['Grey squirrel', 1.81, 7.5, 'm'], ['Rabbit', 1.62, 10.2, 'm'],
  ['Rat', 1.24, 2.23, 'm'], ['Mouse', 1.21, 0.415, 'm'],
  ['Green-winged macaw', 3.65, 22.8, 'b'], ['African grey parrot', 2.66, 9.5, 'b'], ['Ostrich', 1.97, 41.6, 'b'], ['Emu', 1.35, 29.1, 'b'],
  ['Common raven', 1.09, 15.1, 'b'], ['Budgerigar', 1.06, 1.4, 'b'], ['Rock pigeon', 0.67, 2.3, 'b'], ['Diamond dove', 0.63, 0.64, 'b'],
];
const row = (n) => DATA.find((d) => d[0] === n);
const PICK = {
  mouse: { n: 'Mouse', make: () => makeQuad({ color: 0x9a948c, size: 0.55, leg: 0.2, ear: 0.3, earType: 'round', snout: 0.25, tail: 0.9 }) },
  rabbit: { n: 'Rabbit', make: () => makeQuad({ color: 0xc8b49a, size: 0.8, leg: 0.3, ear: 0.6, earType: 'up', snout: 0.15, tail: 0.1 }) },
  wolf: { n: 'Wolf', make: () => makeQuad({ color: 0x8a8580, size: 1.1, leg: 0.7, ear: 0.25, earType: 'up', snout: 0.5, tail: 0.6 }) },
  lion: { n: 'Lion', make: () => makeQuad({ color: 0xc89a5a, size: 1.4, leg: 0.7, ear: 0.18, earType: 'round', snout: 0.3, tail: 0.8 }) },
  walrus: { n: 'Walrus', make: () => makeQuad({ color: 0x8a6650, size: 1.6, leg: 0.15, legless: true, ear: 0, snout: 0.15, tail: 0, tusks: true }) },
  camel: { n: 'Bactrian camel', make: () => makeQuad({ color: 0xb08a5a, size: 1.6, leg: 1.1, neck: 0.75, ear: 0.15, earType: 'round', snout: 0.4, tail: 0.3 }) },
  chimp: { n: 'Chimpanzee', make: () => makePrimate({ color: 0x2b2420, face: 0x9a7a66, size: 1.2 }) },
  human: { n: 'Human', make: () => makePrimate({ color: 0x3a6fc4, face: 0xd9a07a, size: 1.35 }) },
  budgie: { n: 'Budgerigar', make: () => makeBird({ color: 0x7fd36a, size: 0.7 }) },
};
const KEYS = Object.keys(PICK);

export default {
  id: 'animals',
  short: 'Animals',
  title: 'Yawning across the animal world',
  subtitle: 'Fish, reptiles, birds and mammals yawn. Bigger brains tend to go with longer yawns.',
  view: { pos: [0.4, 2.6, 7.4], target: [0.4, 1.1, 0] },
  learn: `<p>Yawning is old. Fish, turtles, crocodiles, birds and mammals have all been seen to yawn, which suggests the reflex goes back a very long way in the history of animals with backbones.</p>
    <p>Yawns also differ. In 2016 <b>Andrew Gallup</b> and colleagues timed yawns in 19 kinds of mammals from online videos and found that species with <b>heavier brains</b> and more neurons in the cortex tend to <b>yawn for longer</b>. A bigger 2021 study led by <b>Jorg Massen</b> timed 1,291 yawns from 101 species and found the same pattern in both mammals and birds, with mammals yawning longer than birds.</p>
    <p>That fits the brain-cooling idea: a bigger brain may need a bigger, longer yawn. But it is a pattern across species, not proof of why.</p>
    <p>Some animals catch yawns too: chimpanzees, bonobos, wolves, lions, horses and budgerigars have been reported to. In 2008 a study found that <b>dogs can catch yawns from people</b>, and later work found they catch them more from their owners than from strangers.</p>
    <p class="tip"><b>Try it:</b> pick an animal and watch its yawn play at its average length. Its dot lights up on the chart.</p>
    <p class="note">Chart: species averages computed from the open (CC0) data of Massen et al. 2021, Communications Biology. Brain weights are from the same file. Some species have only a few recorded yawns (humans 12), so the averages are rough. The 3D animals are stylised and not to scale.</p>`,
  terms: [
    { t: 'Vertebrates', d: 'Animals with backbones: fish, amphibians, reptiles, birds and mammals.' },
    { t: 'Cortex', d: 'The wrinkled outer layer of the brain. More cortical neurons went with longer yawns.' },
    { t: 'Log scale', d: 'An axis where each step multiplies the value, so tiny and huge brains fit on one chart.' },
  ],
  defaults: { pick: 'lion', play: true },
  controls: [
    { key: 'pick', type: 'seg', label: 'Animal', options: KEYS.map((k) => ({ v: k, label: PICK[k].n.replace('Bactrian ', '') })), fmt: (v) => `${row(PICK[v].n)[1].toFixed(1)} s average yawn` },
    { key: 'play', type: 'toggle', label: 'Play the yawn' },
  ],
  quiz: [
    { q: 'Which animals have been seen to yawn?', options: ['Only mammals', 'Only primates', 'Fish, reptiles, birds and mammals', 'Only humans and dogs'], answer: 2, why: 'Yawning has been reported across vertebrates, from fish to people.' },
    { q: 'Across species, what goes with longer yawns?', options: ['Smaller bodies', 'Heavier brains with more cortical neurons', 'Living in water', 'Longer tails'], answer: 1, why: 'Gallup (2016) and Massen (2021) both found that bigger-brained species tend to yawn for longer.' },
    { q: 'Can dogs catch yawns from people?', options: ['No, never', 'Studies say yes, more so from their owners', 'Only puppies', 'Only from other dogs'], answer: 1, why: 'A 2008 study found dogs catch human yawns, and later work found a stronger effect with their owners.' },
  ],
  reel: [
    { ms: 5600, caption: 'Fish, birds, reptiles and mammals all yawn. And species with bigger brains tend to yawn for longer.', set: { pick: 'mouse', play: true }, act: (s, inst) => inst.cycle?.(['mouse', 'budgie', 'lion', 'human']), view: { pos: [0.4, 2.6, 7.4], target: [0.4, 1.1, 0] }, spin: 0 },
  ],
  build({ stage, s, label }) {
    stage.setShift(0, -0.06); stage.scene.background = new THREE.Color(0x0b0d14);
    const holder = new THREE.Group(); holder.position.set(-0.6, 0, 0); stage.root.add(holder);
    const fish = makeFish({ size: 0.8 }); fish.position.set(-3.4, 0.2, -1.2); fish.rotation.y = 0.4; stage.root.add(fish);
    const lbFish = label('Fish yawn too', [0, 1.5, 0], fish);
    let cur = null, curKey = '', tt = 0, cycle = null;
    const show = (k) => {
      if (cur) { holder.remove(cur); cur.traverse((o) => { o.geometry?.dispose(); }); }
      cur = PICK[k].make(); cur.rotation.y = k === 'chimp' || k === 'human' ? 0.25 : -0.5; holder.add(cur); curKey = k; tt = 0;
    };
    const pn = hud(stage, 600, 420, (g, w, h, st) => st && draw(g, w, h, st), { wFrac: 0.38, top: 0.06 });
    const draw = (g, w, h, st) => {
      card(g, w, h, 'Brain weight and yawn length');
      const L = 70, R = w - 24, T = 60, B = h - 74;
      const X = (b) => L + ((R - L) * (Math.log10(b) + 0.5)) / 3.7, Y = (d) => B - ((B - T) * d) / 9.5;
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1; g.font = FONT(17); g.fillStyle = '#737a8e'; g.textAlign = 'center';
      for (const b of [1, 10, 100, 1000]) { g.beginPath(); g.moveTo(X(b), T); g.lineTo(X(b), B); g.stroke(); g.fillText(b >= 1000 ? '1 kg' : b + ' g', X(b), B + 22); }
      g.textAlign = 'right'; for (const d of [0, 2, 4, 6, 8]) { g.beginPath(); g.moveTo(L, Y(d)); g.lineTo(R, Y(d)); g.stroke(); g.fillText(d + ' s', L - 8, Y(d) + 6); }
      g.textAlign = 'center'; g.fillText('brain weight (log scale)', (L + R) / 2, h - 34);
      g.font = FONT(14); g.fillText('Data: Massen et al. 2021, Communications Biology (CC0)', (L + R) / 2, h - 12);
      const sel = row(PICK[st.pick].n);
      for (const d of DATA) { g.fillStyle = d[3] === 'b' ? 'rgba(163,230,53,0.75)' : 'rgba(255,107,154,0.7)'; g.beginPath(); g.arc(X(d[2]), Y(d[1]), 6, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(sel[2]), Y(sel[1]), 11, 0, Math.PI * 2); g.fill();
      g.font = FONT(19, 600); g.textAlign = X(sel[2]) > w * 0.6 ? 'right' : 'left'; g.fillText(sel[0], X(sel[2]) + (g.textAlign === 'right' ? -16 : 16), Y(sel[1]) + 6);
      g.font = FONT(16); g.textAlign = 'left'; g.fillStyle = 'rgba(255,107,154,0.9)'; g.fillText('● mammals', L + 6, T + 18); g.fillStyle = 'rgba(163,230,53,0.9)'; g.fillText('● birds', L + 110, T + 18);
    };
    return {
      cycle(list) { cycle = { list, i: 0, t: 0 }; s.pick = list[0]; },
      dispose() { clearHuds(); },
      update(dt, st) {
        if (cycle) { cycle.t += dt; if (cycle.t > 1.4 && cycle.i < cycle.list.length - 1) { cycle.t = 0; cycle.i++; st.pick = cycle.list[cycle.i]; } }
        if (st.pick !== curKey) show(st.pick);
        tt += dt;
        const D = row(PICK[st.pick].n)[1], cyc = D + 1.5;
        const u = st.play ? (tt % cyc) / D : -1;
        cur.yawn(pose(u));
        const fu = (tt % 3) / 1.2; fish.yawn(pose(fu)); fish.position.y = 0.2 + Math.sin(tt * 1.3) * 0.08;
        pn.redraw(st); pn.dock();
      },
      readout(st) {
        const d = row(PICK[st.pick].n);
        return `<div class="big">${d[0]}</div>
          <div class="row"><span>Average yawn</span><b>${d[1].toFixed(1)} s</b></div>
          <div class="row"><span>Brain weight</span><b>${d[2] >= 1000 ? (d[2] / 1000).toFixed(2) + ' kg' : d[2] + ' g'}</b></div>
          <p class="note">Species averages from Massen et al. 2021 (open data).</p>`;
      },
    };
  },
};
