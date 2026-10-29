import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'

export const entrance = { width: 1.6, height: 2.35, z: 2.55, thickness: .12 }
export const cameraClearance = .23

// The approach stays outside the facade until it is aligned with the opening.
// Interior points skirt the coffee table and stop in the clear aisle by the sofa.
const positions = new CatmullRomCurve3([
  new Vector3(7, 6.2, 8.8),
  new Vector3(3.8, 3.5, 7.2),
  new Vector3(0, 1.65, 4),
  new Vector3(0, 1.65, 1.6),
  new Vector3(-.7, 1.65, .9),
  new Vector3(-1, 1.65, .45),
  new Vector3(-.95, 1.65, .8),
], false, 'centripetal')

const targets = new CatmullRomCurve3([
  new Vector3(0, .6, 0),
  new Vector3(0, .9, -.2),
  new Vector3(0, 1.3, -1.2),
  new Vector3(-.25, 1.05, -1.35),
  new Vector3(-.1, .9, -1.2),
  new Vector3(.6, .85, -.65),
  new Vector3(1.75, .7, -1.2),
], false, 'centripetal')

export function journeyPose(progress: number, position = new Vector3(), target = new Vector3()) {
  const p = MathUtils.clamp(progress, 0, 1)
  // Ease only the route ends. Sampling is absolute, so reversing never accumulates drift.
  const t = p * p * (3 - 2 * p)
  positions.getPoint(t, position)
  targets.getPoint(t, target)
  // Human eye level once the approach has descended to the doorway.
  if (t >= 1 / 3) position.y = 1.65
  return { position, target, progress: p, pathProgress: t }
}
