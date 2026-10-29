import { describe, expect, it } from 'vitest'
import { Box3, Sphere, Vector3 } from 'three'
import { cameraClearance, entrance, journeyPose } from '../features/landing/journeyPath'
import { createProject } from '../features/templates/templates'
import { canWalk } from '../features/editor/geometry'

describe('landing camera journey', () => {
  it('starts outside, enters at eye level and ends in the room with a different viewing direction', () => {
    expect(journeyPose(0).position.toArray()).toEqual([7, 6.2, 8.8])
    const interior = journeyPose(.75)
    expect(interior.position.y).toBe(1.65)
    expect(interior.position.z).toBeLessThan(2.5)
    journeyPose(1).position.toArray().forEach((value, axis) => expect(value).toBeCloseTo([-.95, 1.65, .8][axis], 8))
    expect(journeyPose(1).target.x).toBeGreaterThan(1.5)
  })

  it('keeps the full interpolated route clear of the floor, walls, entrance frame and furniture', () => {
    const project = createProject('living')
    const pierWidth = (5 - entrance.width) / 2
    const solids: [number[], number[]][] = [
      [[0, 1.4, -2.55], [5.12, 2.8, .12]],
      [[-2.55, 1.4, 0], [.12, 2.8, 5.12]],
      [[2.55, 1.4, 0], [.12, 2.8, 5.12]],
      ...[-1, 1].map(sign => [[sign * (entrance.width / 2 + pierWidth / 2), 1.4, entrance.z], [pierWidth, 2.8, entrance.thickness]] as [number[], number[]]),
      [[0, (2.8 + entrance.height) / 2, entrance.z], [entrance.width, 2.8 - entrance.height, .18]],
      ...[-1, 1].map(sign => [[sign * (entrance.width / 2 + .025), entrance.height / 2, entrance.z], [.05, entrance.height, .18]] as [number[], number[]]),
    ]
    const walls = solids.map(([center, size]) => new Box3().setFromCenterAndSize(new Vector3(...center), new Vector3(...size)))
    let crossings = 0
    for (let step = 0; step <= 2000; step++) {
      const p = step / 2000
      const { position, target } = journeyPose(p)
      const body = new Sphere(position, cameraClearance)
      expect(position.y, `floor clearance at ${p}`).toBeGreaterThan(cameraClearance)
      expect(walls.some(wall => wall.intersectsSphere(body)), `wall collision at ${p}`).toBe(false)
      expect(position.distanceTo(target)).toBeGreaterThan(.1)
      if (position.z < 2.27 && position.y < 2) expect(canWalk(position.x, position.z, project.room, project.objects), `furniture collision at ${p}`).toBe(true)
      if (Math.abs(position.z - entrance.z) < .05) { crossings++; expect(Math.abs(position.x)).toBeLessThan(entrance.width / 2 - cameraClearance); expect(position.y).toBe(1.65) }
    }
    expect(crossings).toBeGreaterThan(0)
  })

  it('is continuous, bounded and deterministic when scrubbed backwards or jumped', () => {
    const forward = Array.from({ length: 101 }, (_, index) => journeyPose(index / 100).position.toArray())
    for (let index = 100; index >= 0; index--) expect(journeyPose(index / 100).position.toArray()).toEqual(forward[index])
    for (let index = 1; index < forward.length; index++) expect(new Vector3(...forward[index]).distanceTo(new Vector3(...forward[index - 1]))).toBeLessThan(.5)
    expect(journeyPose(-10).position.toArray()).toEqual(forward[0])
    expect(journeyPose(10).position.toArray()).toEqual(forward[100])
  })
})
