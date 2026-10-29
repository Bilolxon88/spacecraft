import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

const root = path.resolve('public/assets/showcase')
const { assets } = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'))
let bytes = 0
let triangles = 0
for (const asset of assets) {
  assert.ok(asset.source && asset.license && Object.keys(asset.authors).length)
  for (const file of asset.files) {
    const filename = path.resolve(root, file.path)
    assert.ok(filename.startsWith(root + path.sep))
    const buffer = await fs.readFile(filename)
    assert.equal(createHash('sha256').update(buffer).digest('hex'), file.sha256, file.path)
    assert.equal(buffer.length, file.bytes, file.path)
    bytes += buffer.length
    let gltf
    if (filename.endsWith('.gltf')) gltf = JSON.parse(buffer.toString())
    if (filename.endsWith('.glb')) {
      assert.equal(buffer.readUInt32LE(0), 0x46546c67)
      gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString())
    }
    if (!gltf) continue
    for (const reference of [...(gltf.buffers || []), ...(gltf.images || [])]) {
      if (!reference.uri || reference.uri.startsWith('data:')) continue
      assert.ok(!reference.uri.includes('://'), 'No runtime third-party URLs')
      await fs.access(path.resolve(path.dirname(filename), reference.uri))
    }
    for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
      assert.ok(primitive.attributes.NORMAL !== undefined)
      triangles += gltf.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3
    }
  }
}
console.log(`Verified ${assets.length} licensed assets, every dependency and SHA-256 checksum.`)
console.log(`${(bytes / 1048576).toFixed(2)} MiB on disk; ${triangles.toLocaleString()} furniture triangles before procedural architecture.`)
