// Build-time acquisition only. Runtime rendering uses bundled, same-origin files.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const root = path.resolve('public/assets/showcase')
const headers = { 'User-Agent': 'SpaceCraftAssetPipeline/1.0' }
const manifest = []
async function json(url) {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  return response.json()
}
async function save(relative, source) {
  const destination = path.resolve(root, relative)
  if (!destination.startsWith(root + path.sep)) throw new Error('Unsafe asset path')
  let bytes
  try { bytes = await fs.readFile(destination) } catch { /* first download */ }
  if (!bytes || (source.md5 && createHash('md5').update(bytes).digest('hex') !== source.md5)) {
    const response = await fetch(source.url, { headers })
    if (!response.ok) throw new Error(`${response.status}: ${source.url}`)
    bytes = Buffer.from(await response.arrayBuffer())
  }
  if (source.md5 && createHash('md5').update(bytes).digest('hex') !== source.md5) throw new Error(`Checksum mismatch: ${relative}`)
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, bytes)
  return { path: relative.replaceAll('\\', '/'), url: source.url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
}
async function poly(id, kind, resolution = '1k') {
  const [files, info] = await Promise.all([json(`https://api.polyhaven.com/files/${id}`), json(`https://api.polyhaven.com/info/${id}`)])
  const entry = { id, name: info.name, authors: info.authors, source: `https://polyhaven.com/a/${id}`, license: 'CC0-1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', dimensions: info.dimensions, files: [] }
  if (kind === 'model') {
    const model = files.gltf[resolution].gltf
    entry.files.push(await save(`${id}/model.gltf`, model))
    for (const [relative, asset] of Object.entries(model.include)) entry.files.push(await save(`${id}/${relative}`, asset))
  } else if (kind === 'hdri') {
    entry.files.push(await save(`${id}/environment.hdr`, files.hdri[resolution].hdr))
  } else {
    for (const [type, filename] of [['diff','color'],['nor_gl','normal'],['rough','roughness'],['ao','ao']]) {
      const key = Object.keys(files).find(key => key.toLowerCase() === type || (type === 'diff' && key === 'Diffuse'))
      if (key) entry.files.push(await save(`${id}/${filename}.jpg`, files[key][resolution].jpg))
    }
  }
  manifest.push(entry)
  console.log(`Acquired ${id}: ${(entry.files.reduce((sum, file) => sum + file.bytes, 0) / 1048576).toFixed(2)} MiB`)
}
for (const id of ['modern_arm_chair_01','modern_coffee_table_01','potted_plant_02','modern_ceiling_lamp_01','ceramic_vase_01']) await poly(id, 'model')
await poly('wood_floor', 'texture', '2k')
await poly('white_plaster_02', 'texture')
await poly('fabric_pattern_07', 'texture')
await poly('artist_workshop', 'hdri')
const sofaSource = 'https://api.github.com/repos/KhronosGroup/glTF-Sample-Assets/contents/Models/GlamVelvetSofa'
const sofaFiles = await json(`${sofaSource}/glTF-Binary?ref=main`)
const glb = sofaFiles.find(file => file.name.endsWith('.glb'))
const licenseFiles = await json(sofaSource)
const license = licenseFiles.find(file => file.name === 'LICENSE.md')
manifest.push({ id: 'GlamVelvetSofa', name: 'Glam Velvet Sofa', authors: { 'Eric Chadwick': 'Everything', 'Wayfair, LLC': 'Copyright 2021' }, source: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa', license: 'CC-BY-4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', modifications: 'Uniform scale; warm cream upholstery finish; embedded presentation light removed at runtime.', files: [await save('GlamVelvetSofa/model.glb', { url: glb.download_url }), await save('GlamVelvetSofa/LICENSE.md', { url: license.download_url })] })
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({ acquired: new Date().toISOString(), attribution: 'Powered by Poly Haven. Glam Velvet Sofa © 2021 Wayfair, LLC, by Eric Chadwick (CC BY 4.0).', assets: manifest }, null, 2) + '\n')
console.log('Asset manifest written with source URLs, licences and SHA-256 hashes.')
