// Captures the application's own geometry. No reference-image pixels are used.
import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto('http://127.0.0.1:5173/')
  await page.waitForSelector('.journey-stage[data-rendered="true"]', { timeout: 60000 })
  for (const [name, url] of [['sofa', '/assets/showcase/GlamVelvetSofa/model.glb'], ['pendant', '/assets/showcase/modern_ceiling_lamp_01/model.gltf']]) {
    const data = await page.evaluate(async ({ name, url }) => {
      const THREE = await import('/node_modules/three/build/three.module.js')
      const { GLTFLoader } = await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js')
      const { RGBELoader } = await import('/node_modules/three/examples/jsm/loaders/RGBELoader.js')
      const gltf = await new GLTFLoader().loadAsync(url)
      const scene = new THREE.Scene()
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
      renderer.setSize(400, 320)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      const hdr = await new RGBELoader().loadAsync('/assets/showcase/artist_workshop/environment.hdr')
      hdr.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = hdr
      const model = gltf.scene
      const embeddedLights = []
      model.traverse(node => {
        if (node.isLight) embeddedLights.push(node)
        if (node.isMesh && node.material.name.includes('fabric')) { node.material.color.set('#d5cbbb'); node.material.sheenColor?.set('#d5cbbb'); node.material.normalScale?.set(.16,.16) }
      })
      embeddedLights.forEach(light => light.removeFromParent())
      const bounds = new THREE.Box3().setFromObject(model)
      const center = bounds.getCenter(new THREE.Vector3())
      model.position.sub(center)
      scene.add(model)
      const size = bounds.getSize(new THREE.Vector3())
      const radius = Math.max(...size.toArray())
      const camera = new THREE.PerspectiveCamera(35, 400 / 320, .01, 100)
      camera.position.set(radius * 1.25, radius * .7, radius * 1.8)
      camera.lookAt(0, 0, 0)
      const light = new THREE.DirectionalLight('#fff0dc', 2)
      light.position.set(2, 4, 3)
      scene.add(light)
      renderer.render(scene, camera)
      const output = renderer.domElement.toDataURL('image/png')
      renderer.dispose(); hdr.dispose()
      return { name, output }
    }, { name, url })
    await fs.mkdir('public/assets/editor/thumbnails', { recursive: true })
    await fs.writeFile(`public/assets/editor/thumbnails/${name}.png`, Buffer.from(data.output.split(',')[1], 'base64'))
  }
  await fs.mkdir('public/assets/rooms', { recursive: true })
  await fs.mkdir('docs/redesign', { recursive: true })
  for (const template of ['living', 'bedroom', 'office', 'empty']) {
    const id = await page.evaluate(async template => {
      const { createProject } = await import('/src/features/templates/templates.ts')
      const { db } = await import('/src/db/database.ts')
      const project = createProject(template)
      await db.projects.put(project)
      await db.preferences.put({ key: 'settings', value: { theme: 'dark', quality: 'medium', grid: false, snap: true, tutorialDone: true, units: 'm' } })
      return project.id
    }, template)
    await page.goto(`http://127.0.0.1:5173/editor/${id}`)
    await page.locator('canvas').waitFor()
    if (template !== 'empty') await page.waitForFunction(() => Object.keys(JSON.parse(document.querySelector('canvas')?.dataset.loadedModels || '{}')).length > 0)
    await page.waitForTimeout(2500)
    if (template === 'living') await page.screenshot({ path: 'docs/redesign/editor.png' })
    await page.getByRole('button', { name: 'Collapse library', exact: true }).click()
    await page.getByRole('button', { name: 'Collapse inspector', exact: true }).click()
    await page.waitForTimeout(1200)
    const data = await page.locator('canvas').evaluate(canvas => canvas.toDataURL('image/png'))
    await fs.writeFile(`public/assets/rooms/${template}.png`, Buffer.from(data.split(',')[1], 'base64'))
  }
  await page.goto('http://127.0.0.1:5173/')
  await page.waitForSelector('.journey-stage[data-rendered="true"]')
  await page.screenshot({ path: 'docs/redesign/landing.png' })
  console.log('Captured real model thumbnails, four room previews, and landing/editor verification screenshots.')
} finally { await browser.close() }
