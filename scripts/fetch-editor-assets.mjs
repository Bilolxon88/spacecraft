// Build-time asset acquisition. Only URLs returned by the official Poly Haven API are used.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { Box3, Matrix4, Quaternion, Vector3 } from 'three'

const root = path.resolve('public/assets/editor')
const headers = { 'User-Agent': 'SpaceCraftAssetPipeline/1.0' }
const catalog = JSON.parse(await fs.readFile('.asset-cache/models.json', 'utf8'))
const textures = JSON.parse(await fs.readFile('.asset-cache/textures.json', 'utf8'))
const modelIds = ['side_table_01', 'modern_wooden_cabinet', 'drawer_cabinet', 'dining_chair_02', 'metal_office_desk', 'coffee_table_round_01', 'mid_century_lounge_chair']
const assets = []
const execFileAsync = promisify(execFile)
async function download(url) {
  // Windows uses its system trust store. Certificate verification remains enabled;
  // offline revocation endpoints are tolerated instead of disabling HTTPS validation.
  const args = ['--fail', '--silent', '--show-error', '--location', '--connect-timeout', '30', '--max-time', '180', '--retry', '2', '--retry-all-errors', '-A', headers['User-Agent'], url]
  if (process.platform === 'win32') args.unshift('--ssl-revoke-best-effort')
  const { stdout } = await execFileAsync(process.platform === 'win32' ? 'curl.exe' : 'curl', args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, windowsHide: true })
  return stdout
}
async function json(url) {
  return JSON.parse((await download(url)).toString('utf8'))
}
async function save(relative, source) {
  const destination = path.resolve(root, relative)
  if (!destination.startsWith(root + path.sep)) throw new Error('Unsafe asset path')
  let bytes
  try { bytes = await fs.readFile(destination) } catch { /* first acquisition */ }
  if (!bytes || (source.md5 && createHash('md5').update(bytes).digest('hex') !== source.md5)) {
    bytes = await download(source.url)
  }
  if (source.md5 && createHash('md5').update(bytes).digest('hex') !== source.md5) throw new Error(`Checksum mismatch: ${relative}`)
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, bytes)
  return { path: relative.replaceAll('\\', '/'), url: source.url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
}
function bounds(gltf) {
  const box = new Box3()
  function visit(index, parent) {
    const node = gltf.nodes[index]
    const local = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().compose(new Vector3(...(node.translation || [0, 0, 0])), new Quaternion(...(node.rotation || [0, 0, 0, 1])), new Vector3(...(node.scale || [1, 1, 1])))
    const world = parent.clone().multiply(local)
    for (const primitive of gltf.meshes?.[node.mesh]?.primitives || []) {
      const accessor = gltf.accessors[primitive.attributes.POSITION]
      if (accessor.min && accessor.max) box.union(new Box3(new Vector3(...accessor.min), new Vector3(...accessor.max)).applyMatrix4(world))
    }
    for (const child of node.children || []) visit(child, world)
  }
  for (const node of gltf.scenes[gltf.scene || 0].nodes) visit(node, new Matrix4())
  return { min: box.min.toArray(), max: box.max.toArray(), size: box.getSize(new Vector3()).toArray(), center: box.getCenter(new Vector3()).toArray(), axes: 'glTF Y-up; size is X width, Y height, Z depth in metres' }
}
for (const id of [...modelIds, 'marble_01', 'concrete_wall_009']) {
  const info = catalog[id] || textures[id]
  if (!info) throw new Error(`Asset ${id} absent from official metadata`)
  const files = await json(`https://api.polyhaven.com/files/${id}`)
  const entry = { id, name: info.name, kind: modelIds.includes(id) ? 'model' : 'texture', authors: info.authors, source: `https://polyhaven.com/a/${id}`, license: 'CC0-1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', sourceDimensionsMm: info.dimensions, files: [] }
  if (entry.kind === 'model') {
    const model = files.gltf?.['1k']?.gltf
    if (!model) throw new Error(`${id} has no 1K glTF`)
    entry.files.push(await save(`${id}/model.gltf`, model))
    const dependencies = Object.entries(model.include)
    for (let i = 0; i < dependencies.length; i += 3) {
      entry.files.push(...await Promise.all(dependencies.slice(i, i + 3).map(([relative, source]) => save(`${id}/${relative}`, source))))
    }
    const gltf = JSON.parse(await fs.readFile(path.join(root, id, 'model.gltf'), 'utf8'))
    entry.bounds = bounds(gltf)
  } else {
    for (const [type, filename] of [['diff', 'color'], ['nor_gl', 'normal'], ['rough', 'roughness'], ['ao', 'ao']]) {
      const key = Object.keys(files).find(key => key.toLowerCase() === type || (type === 'diff' && key === 'Diffuse'))
      if (key && files[key]?.['1k']?.jpg) entry.files.push(await save(`${id}/${filename}.jpg`, files[key]['1k'].jpg))
    }
  }
  if (info.thumbnail_url) entry.files.push(await save(`${id}/thumbnail.webp`, { url: info.thumbnail_url }))
  assets.push(entry)
  console.log(`${id}: ${(entry.files.reduce((sum, file) => sum + file.bytes, 0) / 1048576).toFixed(2)} MiB`)
  await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({ acquired: new Date().toISOString(), attribution: 'Powered by Poly Haven. All listed assets are CC0.', assets }, null, 2) + '\n')
}
for (const id of ['modern_arm_chair_01', 'modern_coffee_table_01', 'potted_plant_02', 'ceramic_vase_01']) {
  const info = catalog[id]
  assets.push({ id, name: info.name, kind: 'thumbnail', authors: info.authors, source: `https://polyhaven.com/a/${id}`, license: 'CC0-1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', files: [await save(`thumbnails/${id}.webp`, { url: info.thumbnail_url })] })
}
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({ acquired: new Date().toISOString(), attribution: 'Powered by Poly Haven. All listed assets are CC0.', assets }, null, 2) + '\n')
console.log('Editor assets verified and manifest written.')
