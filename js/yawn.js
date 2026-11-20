// Shared parts for YawnClear: the shape of a yawn over time, a stylised head with a hinged jaw, eyelids,
// ears and a see-through chest, small people for the yawning room, and flat heads-up panels that sit in the
// corner of the 3D view. Everything is a function of the clock you pass in, so scrubbing and the director work.
import { THREE, M, sphere, canvasTexture, clamp, lerp, smooth, tube, beam } from './kit.js';

export { THREE, M, sphere, clamp, lerp, smooth, tube, beam };
export const COL = { skin: 0xe0a989, skin2: 0xc98b6b, lip: 0xb5655a, mouth: 0x3a1418, tongue: 0xd06a72, teeth: 0xf4efe6, iris: 0x4a3426, brain: 0xf2a7b5, lung: 0xff8fa3, air: 0x8ef0ff, warm: 0xff7a59, cool: 0x8ef0ff, amber: 0xffb547, violet: 0xc49bff, lime: 0xa3e635, pink: 0xff6b9a };
export const hex = (n) => '#' + n.toString(16).padStart(6, '0');
export const FONT = (px, w = 400) => `${w} ${Math.round(px * 1.18)}px Geist, ui-sans-serif, system-ui, sans-serif`;
export const YAWN_S = 6; // a typical human yawn lasts about 6 seconds (published means vary, roughly 4 to 7 s)

// ---------------------------------------------------------------- the shape of a yawn
// u is the fraction of the way through one yawn (0..1). Outside that range the face is at rest.
// The phases follow the usual description: a long, slow, deep inhale with the jaw opening wide, a short
// peak (the "acme") with the muscles stretched and the eyes squeezed shut, then a quicker exhale as the jaw closes.
export const PHASES = [
  { name: 'Inhale', from: 0, to: 0.6, color: '#8ef0ff' },
  { name: 'Peak', from: 0.6, to: 0.74, color: '#ff6b9a' },
  { name: 'Exhale', from: 0.74, to: 1, color: '#ffb547' },
];
export function phaseAt(u) { if (u < 0 || u > 1) return null; return PHASES.find((p) => u <= p.to) || PHASES[2]; }
export function pose(u) {
  if (!(u > 0 && u < 1)) return { jaw: 0, air: 0, eyes: 0, stretch: 0, ear: 0, brow: 0 };
  const jaw = u < 0.6 ? Math.pow(smooth(u / 0.6), 1.3) : u < 0.74 ? 1 : 1 - smooth((u - 0.74) / 0.2);
  const air = u < 0.6 ? smooth(u / 0.6) : u < 0.74 ? 1 : 1 - smooth((u - 0.74) / 0.26);
  const eyes = smooth((u - 0.38) / 0.2) * (1 - smooth((u - 0.8) / 0.15));
  const stretch = smooth((u - 0.25) / 0.35) * (1 - smooth((u - 0.76) / 0.2));
  return { jaw, air, eyes, stretch, ear: jaw * stretch, brow: stretch };
}

// ---------------------------------------------------------------- a stylised head (faces +z)
// Returns a group with .set(p) for a pose, .see(alpha) for the see-through cutaway, and handles to the parts.
export function makeHead({ scale = 1, skin = COL.skin, inside = true, hair = 0x2b1d16 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(scale);
  const skinM = M.matte(skin, { roughness: 0.65, transparent: true });
  const lipM = M.matte(COL.lip, { roughness: 0.6, transparent: true });
  const hairM = M.matte(hair, { roughness: 0.95, transparent: true });
  const skull = sphere(1, skinM, 48); skull.scale.set(0.88, 1.02, 0.98); skull.position.y = 0.15;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.02, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), hairM); cap.scale.set(0.9, 1.03, 1.0); cap.position.set(0, 0.17, -0.04); cap.rotation.x = -0.35;
  const cheeks = sphere(0.8, skinM, 40); cheeks.scale.set(0.93, 0.48, 0.88); cheeks.position.set(0, -0.25, 0.16);
  const nose = sphere(0.16, skinM, 20); nose.scale.set(0.8, 1.2, 1); nose.position.set(0, -0.08, 0.98);
  // mouth interior: a dark pocket, seen when the jaw drops
  const cav = sphere(0.42, M.matte(COL.mouth, { roughness: 1 }), 24); cav.scale.set(0.85, 0.8, 0.8); cav.position.set(0, -0.55, 0.3);
  const teethTop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 30, Math.PI), M.plastic(COL.teeth)); teethTop.rotation.x = Math.PI / 2; teethTop.position.set(0, -0.5, 0.27); teethTop.scale.set(1, 1.05, 1);
  const lipTop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 30, Math.PI), lipM); lipTop.rotation.x = Math.PI / 2; lipTop.position.set(0, -0.52, 0.25); lipTop.scale.set(1, 1.05, 1);
  g.add(skull, cap, cheeks, nose, cav, teethTop, lipTop);
  // jaw hinged low and behind the mouth, so the chin drops and tucks back
  const jaw = new THREE.Group(); jaw.position.set(0, -0.55, -0.35); g.add(jaw);
  const chin = sphere(0.72, skinM, 40); chin.scale.set(0.8, 0.4, 0.88); chin.position.set(0, -0.17, 0.53);
  const tongue = sphere(0.28, M.matte(COL.tongue, { roughness: 0.5 }), 18); tongue.scale.set(1, 0.3, 1.1); tongue.position.set(0, -0.1, 0.58);
  const teethBot = teethTop.clone(); teethBot.position.set(0, -0.04, 0.62);
  const lipBot = lipTop.clone(); lipBot.position.set(0, -0.02, 0.6);
  jaw.add(chin, tongue, teethBot, lipBot);
  // eyes with lids
  const eyes = [], lids = [], brows = [];
  for (const sx of [-1, 1]) {
    const e = sphere(0.14, M.plastic(0xf6f3ee), 20); e.position.set(sx * 0.33, 0.1, 0.8);
    const iris = sphere(0.07, M.plastic(COL.iris, { roughness: 0.2 }), 16); iris.position.set(0, 0, 0.075); e.add(iris);
    const pup = sphere(0.035, M.glow(0x050505), 10); pup.position.set(0, 0, 0.11); e.add(pup);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.162, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), skinM); lid.position.copy(e.position);
    const lid2 = lid.clone(); lid2.rotation.x = Math.PI; // lower lid
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.22, 4, 8), hairM); brow.rotation.z = Math.PI / 2 + sx * 0.1; brow.position.set(sx * 0.33, 0.33, 0.83);
    g.add(e, lid, lid2, brow); eyes.push(e); lids.push([lid, lid2]); brows.push(brow);
  }
  // ears, with an eardrum that shows in the cutaway
  const ears = [], drums = [];
  for (const sx of [-1, 1]) {
    const ear = sphere(0.22, skinM, 18); ear.scale.set(0.35, 1, 0.65); ear.position.set(sx * 0.9, 0.0, -0.05); g.add(ear); ears.push(ear);
    const drum = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), M.glow(COL.amber, { transparent: true, opacity: 0, side: THREE.DoubleSide })); drum.rotation.y = Math.PI / 2; drum.position.set(sx * 0.62, -0.02, -0.05); g.add(drum); drums.push(drum);
  }
  // inside: brain, airway, (chest is separate)
  let brain = null, airway = null;
  if (inside) {
    brain = sphere(0.68, M.matte(COL.brain, { roughness: 0.55, transparent: true, opacity: 0 }), 32); brain.scale.set(0.95, 0.78, 1.05); brain.position.set(0, 0.42, -0.05);
    airway = tube([[0, -0.1, 0.95], [0, -0.3, 0.6], [0, -0.6, 0.1], [0, -0.95, -0.2], [0, -1.6, -0.2]], 0.09, M.glow(COL.air, { transparent: true, opacity: 0 }), false, 60);
    g.add(brain, airway);
  }
  const fades = [skinM, lipM, hairM];
  g.see = (a) => { // a: 0 solid .. 1 see-through
    fades.forEach((m) => { m.opacity = lerp(1, 0.16, a); m.depthWrite = a < 0.5; });
    if (brain) { brain.material.opacity = a * 0.9; brain.visible = a > 0.02; }
    if (airway) { airway.material.opacity = a * 0.55; airway.visible = a > 0.02; }
    drums.forEach((d) => { d.material.opacity = a; d.visible = a > 0.02; });
  };
  g.set = (p) => {
    jaw.rotation.x = p.jaw * 0.7; jaw.position.z = -0.35 + p.jaw * 0.2; jaw.position.y = -0.55 - p.jaw * 0.04;
    lids.forEach(([a, b]) => { a.rotation.x = lerp(-0.55, 1.42, p.eyes); b.rotation.x = Math.PI + lerp(0.7, -1.2, p.eyes); });
    brows.forEach((b) => { b.position.y = 0.33 + p.brow * 0.05 - p.eyes * 0.03; });
    drums.forEach((d) => d.scale.setScalar(1 + p.ear * 0.25));
    ears.forEach((e, i) => { e.rotation.x = p.jaw * 0.08; });
  };
  g.see(0); g.set(pose(0));
  Object.assign(g, { jaw, brain, airway, drums, eyes, cav, skinM });
  return g;
}

// ---------------------------------------------------------------- a person for the yawning room
export function makePerson(color = 0x5b7bd8, skin = COL.skin, hair = 0x2b1d16) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 6, 16), M.matte(color, { roughness: 0.8 })); body.position.y = 0.75; body.castShadow = true;
  const head = makeHead({ scale: 0.3, skin, hair, inside: false }); head.position.y = 1.62;
  g.add(body, head);
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.36, 1.18, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), M.matte(color, { roughness: 0.8 })); arm.position.y = -0.33; arm.castShadow = true;
    const hand = sphere(0.09, M.matte(skin), 10); hand.position.y = -0.66;
    sh.add(arm, hand); g.add(sh); arms.push({ sh, sx });
  }
  g.set = (p) => {
    head.set(p);
    head.rotation.x = -p.jaw * 0.25;
    arms.forEach(({ sh, sx }) => { sh.rotation.z = sx * lerp(0.08, 2.6, p.stretch); sh.rotation.x = -p.stretch * 0.2; });
    body.scale.y = 1 + p.air * 0.04;
  };
  g.head = head;
  g.set(pose(0));
  return g;
}

// ---------------------------------------------------------------- see-through chest with lungs
export function makeChest() {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 0.9, 8, 24), M.clear(0xe0a989, 0.14)); shell.scale.set(1.25, 1, 0.7); g.add(shell);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.8, 24), M.clear(0xe0a989, 0.14)); neck.position.y = 1.45; g.add(neck);
  const lungs = [];
  for (const sx of [-1, 1]) { const l = sphere(0.5, M.matte(COL.lung, { roughness: 0.5, transparent: true, opacity: 0.85 }), 28); l.scale.set(0.75, 1.1, 0.7); l.position.set(sx * 0.42, 0.15, 0); g.add(l); lungs.push(l); }
  const trachea = beam([0, 1.9, -0.05], [0, 0.75, 0], 0.07, M.glow(COL.air, { transparent: true, opacity: 0.55 }));
  g.add(trachea);
  g.set = (air) => lungs.forEach((l) => { const k = 1 + air * 0.32; l.scale.set(0.75 * k, 1.1 * (1 + air * 0.2), 0.7 * k); });
  const skins = [shell.material, neck.material];
  g.see = (a) => { skins.forEach((m) => { m.color.set(0xe0a989); m.opacity = 0.92 - 0.78 * a; m.depthWrite = a < 0.5; }); lungs.forEach((l) => (l.visible = a > 0.02)); trachea.visible = a > 0.02; };
  g.see(0);
  return g;
}

// ---------------------------------------------------------------- air particles drawn into the mouth
export class Breath {
  constructor(parent, n = 60, color = COL.air) {
    this.n = n;
    this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), M.glow(color, { transparent: true, opacity: 0.85 }), n);
    this.mesh.frustumCulled = false; parent.add(this.mesh); this.o = new THREE.Object3D();
    this.seed = Array.from({ length: n }, (_, i) => [Math.sin(i * 12.9898) * 0.5 + 0.5, Math.sin(i * 78.233) * 0.5 + 0.5, Math.sin(i * 39.425) * 0.5 + 0.5]);
  }
  // flow: -1 out .. +1 in; path: list of Vector3 from outside to inside
  update(time, flow, path) {
    const curve = this._c || (this._c = new THREE.CatmullRomCurve3(path));
    for (let i = 0; i < this.n; i++) {
      const [a, b, c] = this.seed[i];
      let k = (time * 0.35 * (0.7 + b * 0.6) + a) % 1; if (flow < 0) k = 1 - k;
      const p = curve.getPoint(k); p.x += (b - 0.5) * 0.25 * (1 - k); p.y += (c - 0.5) * 0.2 * (1 - k);
      this.o.position.copy(p); this.o.scale.setScalar(Math.abs(flow) > 0.05 ? Math.min(1, Math.abs(flow) * 1.5) * (1 - 0.4 * k) : 0.0001); this.o.updateMatrix();
      this.mesh.setMatrixAt(i, this.o.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- heads-up panels fixed to the camera
const HUDS = new Set();
export function clearHuds() { HUDS.forEach((m) => { m.parent?.remove(m); m.material.map?.dispose(); m.material.dispose(); m.geometry.dispose(); }); HUDS.clear(); }
export function hud(stage, pxW, pxH, draw, { wFrac = 0.42, top = 0.075, left = false } = {}) {
  const { tex, redraw } = canvasTexture(pxW, pxH, draw);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, pxH / pxW), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
  mesh.renderOrder = 999; mesh.frustumCulled = false; mesh.redraw = redraw;
  if (!stage.camera.parent) stage.scene.add(stage.camera);
  stage.camera.add(mesh); HUDS.add(mesh);
  mesh.dock = () => {
    const cam = stage.camera, D = 10, hh = D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), hw = hh * cam.aspect;
    const narrow = cam.aspect < 1;
    const wf = narrow ? Math.min(0.94, wFrac * 1.9) : wFrac;
    const w = wf * 2 * hw, h = w * (pxH / pxW);
    mesh.scale.set(w, w, 1);
    const x = left && !narrow ? -hw + w / 2 + 0.015 * 2 * hw : hw - w / 2 - 0.015 * 2 * hw;
    const y = narrow ? -hh + h / 2 + 0.03 * 2 * hh : hh - h / 2 - top * 2 * hh;
    mesh.position.set(narrow ? 0 : x, y, -D);
  };
  mesh.dock();
  return mesh;
}

export function card(g, w, h, title) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(8,10,16,0.86)'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 18); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 2; g.stroke();
  if (title) { g.fillStyle = '#a8aebf'; g.font = FONT(24, 500); g.textAlign = 'left'; g.fillText(title, 22, 38); }
}

// Wrap text on a canvas. Returns the y after the last line.
export function wrap(g, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = t; }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}

// A small seeded random generator so the yawning room plays the same way every time.
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
