import { test, expect } from '@playwright/test'
import { Box3, Sphere, Vector3 } from 'three'
import { cameraClearance, journeyPose } from '../src/features/landing/journeyPath'

test('bundled furniture loads, clears the camera route and exposes licence credits', async ({ page }, info) => {
  const missing: string[] = []
  const external: string[] = []
  page.on('response', response => { if (response.url().includes('/assets/showcase/') && !response.ok()) missing.push(response.url()) })
  page.on('request', request => { if (/polyhaven|githubusercontent/.test(request.url())) external.push(request.url()) })
  await page.goto('/')
  const stage = page.locator('.journey-stage')
  await expect(stage).toHaveAttribute('data-rendered', 'true', { timeout: 30000 })
  const bounds = JSON.parse((await stage.getAttribute('data-asset-bounds'))!) as { name: string; min: number[]; max: number[] }[]
  expect(bounds).toHaveLength(6)
  const boxes = bounds.map(bound => ({ name: bound.name, box: new Box3(new Vector3(...bound.min), new Vector3(...bound.max)) }))
  for (let sample = 0; sample <= 2000; sample++) {
    const body = new Sphere(journeyPose(sample / 2000).position, cameraClearance)
    for (const asset of boxes) expect(asset.box.intersectsSphere(body), `${asset.name}, route ${sample / 2000}`).toBe(false)
  }
  await page.locator('.room-journey').evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + (element.clientHeight - innerHeight) * .72, behavior: 'instant' }))
  await expect.poll(async () => Number(await stage.getAttribute('data-camera-progress'))).toBeGreaterThan(.719)
  const metrics = await stage.evaluate(element => ({ triangles: element.getAttribute('data-triangles'), drawCalls: element.getAttribute('data-draw-calls'), bounds: element.getAttribute('data-asset-bounds') }))
  expect(Number(metrics.triangles)).toBeGreaterThan(100000)
  expect(Number(metrics.drawCalls)).toBeLessThan(100)
  await info.attach('showcase-render-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' })
  await page.screenshot({ path: info.outputPath('showcase-materials.png') })
  await expect(page.locator('.journey-credits')).toBeVisible()
  const credits = await page.request.get('/assets/showcase/credits.html')
  expect(await credits.text()).toContain('© 2021 Wayfair, LLC')
  expect(missing).toEqual([])
  expect(external).toEqual([])
})

test('missing model exits the pinned tour and preserves the landing actions', async ({ page }) => {
  await page.route('**/assets/showcase/GlamVelvetSofa/model.glb', route => route.abort())
  await page.goto('/')
  await expect(page.locator('.room-journey')).toHaveClass(/journey-failed/, { timeout: 30000 })
  await expect(page.locator('.journey-sticky')).toHaveCSS('position', 'relative')
  await expect(page.getByText('3D is unavailable in this browser. Explore the room templates below.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start creating' })).toBeVisible()
  await page.getByRole('link', { name: 'Start creating' }).click()
  await expect(page.getByRole('heading', { name: 'Good spaces start here.' })).toBeVisible()
})
