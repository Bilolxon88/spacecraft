import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Box3, Group, Light, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'
import type { Furniture } from '../../types/project'
import { catalogById } from './catalog'
import { modelAssets } from './modelAssets'

/** Unit-sized bounds preserve the editor's existing metre-based transform contract. */
export function normalizeModel(model: Group, rotation = 0) {
  model.rotation.y = rotation
  const aligned = new Group()
  aligned.add(model)
  aligned.updateMatrixWorld(true)
  const box = new Box3().setFromObject(aligned)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  aligned.scale.set(1 / size.x, 1 / size.y, 1 / size.z)
  aligned.position.set(-center.x / size.x, -box.min.y / size.y, -center.z / size.z)
  return aligned
}

export default function AssetFurniture({ object }: { object: Furniture }) {
  const asset = modelAssets[object.catalogId]
  const { scene } = useGLTF(asset.url)
  const { gl } = useThree()
  const prepared = useMemo(() => {
    const model = scene.clone(true)
    const materials: MeshStandardMaterial[] = []
    const lights: Light[] = []
    model.traverse(node => {
      if (node instanceof Light) lights.push(node)
      if (!(node instanceof Mesh)) return
      node.castShadow = node.receiveShadow = true
      const finish = (source: MeshStandardMaterial) => {
        const material = source.clone()
        if (source.name.toLowerCase().includes(asset.primary.toLowerCase())) {
          const edited = object.material.color !== catalogById[object.catalogId].color || object.material.preset !== 'neutral fabric'
          // Keep authored textures until a finish is edited; normal and AO detail survive edits.
          if (edited || object.catalogId === 'sofa' || object.catalogId === 'loveseat') {
            material.map = null
            material.color.set(object.material.color)
          }
          material.roughness = object.material.roughness
          material.metalness = object.material.metalness
          if (material instanceof MeshPhysicalMaterial) {
            material.sheen = object.material.preset === 'neutral fabric' ? .5 : 0
            material.sheenColor.set(object.material.color)
            material.sheenRoughness = .85
            material.specularColor.set('#ffffff')
            material.specularIntensity = .3
            material.normalScale.set(.16, .16)
          }
        }
        if (!material.aoMap && material.roughnessMap?.name.includes('_arm_')) material.aoMap = material.roughnessMap
        material.aoMapIntensity = .75
        materials.push(material)
        return material
      }
      node.material = Array.isArray(node.material) ? node.material.map(finish) : finish(node.material)
    })
    lights.forEach(light => light.removeFromParent())
    return { model: normalizeModel(model, asset.rotation), materials }
  }, [scene, asset, object.catalogId, object.material])
  useEffect(() => () => prepared.materials.forEach(material => material.dispose()), [prepared])
  useEffect(() => {
    // Read-only metadata from loaded geometry makes editor regression checks concrete.
    const loaded = JSON.parse(gl.domElement.dataset.loadedModels || '{}')
    prepared.model.updateWorldMatrix(true, true)
    const bounds = new Box3().setFromObject(prepared.model)
    loaded[object.id] = { catalogId: object.catalogId, source: asset.url, color: object.material.color, bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() }, finishes: prepared.materials.map(material => ({ name: material.name, color: material.color.getHexString() })), size: object.size, position: object.position, rotation: object.rotation }
    gl.domElement.dataset.loadedModels = JSON.stringify(loaded)
    return () => {
      const current = JSON.parse(gl.domElement.dataset.loadedModels || '{}')
      delete current[object.id]
      gl.domElement.dataset.loadedModels = JSON.stringify(current)
    }
  }, [gl, object, asset, prepared])
  return <primitive object={prepared.model} name={`asset-${object.id}`} dispose={null} />
}
