// Simple stylised animals for YawnClear's animal chapter: a four-legged mammal with a hinged jaw, an upright
// primate, a bird and a fish. Each has .yawn(p) taking a pose from yawn.js. Drawn procedurally, not to scale.
import { THREE, M, sphere, lerp } from './yawn.js';

function capsule(r, len, mat) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat); m.castShadow = true; return m; }

// opts: { color, belly, size, leg, neck, ear, earType: 'up'|'round'|'flop'|'fan', snout, tail, trunk, tusks, legless }
export function makeQuad(o = {}) {
  const c = { color: 0x9a7b5c, size: 1, leg: 0.6, neck: 0.3, ear: 0.25, earType: 'up', snout: 0.35, tail: 0.6, ...o };
  const g = new THREE.Group(), fur = M.matte(c.color, { roughness: 0.9 }), dark = M.matte(0x2a1a14, { roughness: 1 });
  const body = sphere(0.5, fur, 28); body.scale.set(1.5, 0.85, 0.8); body.position.y = c.leg + 0.4; g.add(body);
  if (!c.legless) for (const [x, z] of [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]) { const l = capsule(0.1, c.leg, fur); l.position.set(x, c.leg / 2 + 0.05, z); g.add(l); }
  const neck = new THREE.Group(); neck.position.set(0.65, c.leg + 0.55, 0); neck.rotation.z = -0.5 + c.neck; g.add(neck);
  const headG = new THREE.Group(); headG.position.set(0.25 + c.neck * 0.6, c.neck * 0.8, 0); neck.add(headG);
  const skull = sphere(0.3, fur, 24); skull.scale.set(1.1, 0.95, 0.9); headG.add(skull);
  const snoutU = sphere(0.18, fur, 18); snoutU.scale.set(1 + c.snout * 2, 0.55, 0.85); snoutU.position.set(0.22 + c.snout * 0.35, 0.0, 0); headG.add(snoutU);
  const mouth = sphere(0.15, M.matte(0x3a1418), 14); mouth.scale.set(1 + c.snout * 2, 0.7, 0.7); mouth.position.set(0.2 + c.snout * 0.3, -0.08, 0); headG.add(mouth);
  const jaw = new THREE.Group(); jaw.position.set(0.05, -0.08, 0); headG.add(jaw);
  const jawM = sphere(0.15, fur, 16); jawM.scale.set(1 + c.snout * 2.2, 0.4, 0.75); jawM.position.set(0.18 + c.snout * 0.35, -0.06, 0); jaw.add(jawM);
  const tongue = sphere(0.1, M.matte(0xd06a72), 12); tongue.scale.set(1 + c.snout * 2, 0.3, 0.6); tongue.position.set(0.17 + c.snout * 0.3, -0.02, 0); jaw.add(tongue);
  const nose = sphere(0.05, dark, 10); nose.position.set(0.25 + c.snout * 0.8 + 0.12, 0.04, 0); headG.add(nose);
  for (const z of [-1, 1]) {
    const eye = sphere(0.045, M.glow(0x0a0a0a), 10); eye.position.set(0.18, 0.1, z * 0.2); headG.add(eye);
    let ear;
    if (c.earType === 'fan') { ear = new THREE.Mesh(new THREE.CircleGeometry(c.ear, 20), M.matte(c.color, { side: THREE.DoubleSide })); ear.position.set(-0.08, 0.05, z * 0.3); ear.rotation.y = z * 0.3; }
    else if (c.earType === 'round') { ear = sphere(c.ear * 0.5, fur, 12); ear.scale.set(0.5, 1, 1); ear.position.set(-0.05, 0.25, z * 0.18); }
    else if (c.earType === 'flop') { ear = capsule(c.ear * 0.3, c.ear, fur); ear.position.set(-0.08, 0.0, z * 0.28); ear.rotation.x = z * 0.3; }
    else { ear = new THREE.Mesh(new THREE.ConeGeometry(c.ear * 0.35, c.ear, 10), fur); ear.position.set(-0.05, 0.28 + c.ear * 0.3, z * 0.15); ear.rotation.x = -z * 0.2; }
    if (c.ear > 0) headG.add(ear);
  }
  if (c.trunk) { const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.3, 0, 0], [0.55, -0.15, 0], [0.62, -0.5, 0], [0.55, -0.85, 0]].map((p) => new THREE.Vector3(...p))), 20, 0.07, 8), fur); headG.add(tr); }
  if (c.tusks) for (const z of [-1, 1]) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.45, 8), M.plastic(0xf4efe6)); t.position.set(0.32, -0.3, z * 0.09); t.rotation.z = Math.PI; jaw.add(t); }
  if (c.tail > 0) { const t = capsule(0.04, c.tail, fur); t.position.set(-0.8, c.leg + 0.35, 0); t.rotation.z = 1.1; g.add(t); }
  g.scale.setScalar(c.size);
  g.yawn = (p) => { jaw.rotation.z = -p.jaw * 0.75; headG.rotation.z = p.jaw * 0.25; mouth.scale.y = 0.7 + p.jaw * 0.9; };
  return g;
}

export function makePrimate(o = {}) {
  const c = { color: 0x3a2d24, face: 0x8a6a55, size: 1, ...o };
  const g = new THREE.Group(), fur = M.matte(c.color, { roughness: 0.95 }), face = M.matte(c.face, { roughness: 0.7 });
  const body = sphere(0.5, fur, 24); body.scale.set(0.85, 1.05, 0.7); body.position.y = 0.95; g.add(body);
  for (const x of [-0.25, 0.25]) { const l = capsule(0.13, 0.5, fur); l.position.set(x, 0.35, 0.1); l.rotation.x = 0.8; g.add(l); const a = capsule(0.11, 0.7, fur); a.position.set(x * 2.1, 0.75, 0.15); a.rotation.z = x > 0 ? 0.2 : -0.2; g.add(a); }
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.05); g.add(head);
  const sk = sphere(0.3, fur, 24); sk.scale.set(1, 1, 0.95); head.add(sk);
  const muzzle = sphere(0.18, face, 18); muzzle.scale.set(1.1, 0.6, 0.9); muzzle.position.set(0, -0.06, 0.22); head.add(muzzle);
  const mouth = sphere(0.12, M.matte(0x3a1418), 14); mouth.scale.set(1, 0.6, 0.6); mouth.position.set(0, -0.14, 0.27); head.add(mouth);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.1, 0.05); head.add(jaw);
  const jm = sphere(0.16, face, 16); jm.scale.set(1.05, 0.45, 0.9); jm.position.set(0, -0.08, 0.2); jaw.add(jm);
  for (const sx of [-1, 1]) {
    const cn = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), M.plastic(0xf4efe6)); cn.position.set(sx * 0.07, -0.13, 0.33); head.add(cn);
    const e = sphere(0.035, M.glow(0x0a0a0a), 8); e.position.set(sx * 0.1, 0.06, 0.27); head.add(e);
    const ear = sphere(0.07, face, 10); ear.scale.set(0.4, 1, 1); ear.position.set(sx * 0.3, 0.02, 0); head.add(ear);
  }
  g.scale.setScalar(c.size);
  g.yawn = (p) => { jaw.rotation.x = p.jaw * 0.8; head.rotation.x = -p.jaw * 0.35; mouth.scale.y = 0.6 + p.jaw * 1.4; };
  return g;
}

export function makeBird(o = {}) {
  const c = { color: 0x7fb069, size: 1, ...o };
  const g = new THREE.Group(), mat = M.matte(c.color, { roughness: 0.8 }), beakM = M.plastic(0xffb547);
  const body = sphere(0.35, mat, 24); body.scale.set(1.3, 1, 0.9); body.position.y = 0.6; g.add(body);
  const head = new THREE.Group(); head.position.set(0.38, 0.95, 0); g.add(head);
  head.add(sphere(0.2, mat, 20));
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 12), beakM); top.rotation.z = -Math.PI / 2; top.position.set(0.28, 0.02, 0); head.add(top);
  const jaw = new THREE.Group(); jaw.position.set(0.15, -0.02, 0); head.add(jaw);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 12), beakM); bot.rotation.z = -Math.PI / 2; bot.position.set(0.1, -0.02, 0); jaw.add(bot);
  for (const z of [-1, 1]) { const e = sphere(0.03, M.glow(0x0a0a0a), 8); e.position.set(0.1, 0.06, z * 0.15); head.add(e); const l = capsule(0.025, 0.35, beakM); l.position.set(0, 0.2, z * 0.12); g.add(l); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 8), mat); tail.rotation.z = Math.PI / 2 + 0.3; tail.position.set(-0.5, 0.55, 0); g.add(tail);
  g.scale.setScalar(c.size);
  g.yawn = (p) => { jaw.rotation.z = -p.jaw * 0.7; head.rotation.z = p.jaw * 0.3; };
  return g;
}

export function makeFish(o = {}) {
  const c = { color: 0x8ef0ff, size: 1, ...o };
  const g = new THREE.Group(), mat = M.plastic(c.color, { roughness: 0.4 });
  const body = sphere(0.4, mat, 28); body.scale.set(1.6, 0.8, 0.45); body.position.y = 0.9; g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 4), mat); tail.rotation.z = Math.PI / 2; tail.position.set(-0.75, 0.9, 0); tail.scale.z = 0.3; g.add(tail);
  const jaw = new THREE.Group(); jaw.position.set(0.45, 0.85, 0); g.add(jaw);
  const jm = sphere(0.14, mat, 14); jm.scale.set(1.3, 0.35, 0.8); jm.position.set(0.12, -0.03, 0); jaw.add(jm);
  const mouth = sphere(0.1, M.matte(0x1a0c10), 12); mouth.scale.set(0.6, 0.8, 0.7); mouth.position.set(0.6, 0.88, 0); g.add(mouth);
  for (const z of [-1, 1]) { const e = sphere(0.045, M.glow(0x0a0a0a), 8); e.position.set(0.4, 1.0, z * 0.14); g.add(e); }
  g.scale.setScalar(c.size);
  g.yawn = (p) => { jaw.rotation.z = -p.jaw * 0.8; mouth.scale.y = 0.8 + p.jaw * 1.5; };
  return g;
}
