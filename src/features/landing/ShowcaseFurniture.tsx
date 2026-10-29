import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Group, Light, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'
import { assetRoot, showcaseAssets } from './showcaseAssets'
import type { ShowcaseAsset } from './showcaseAssets'

function Asset({ asset }: { asset: ShowcaseAsset }) {
  const { scene } = useGLTF(assetRoot + asset.file)
  const prepared = useMemo(() => {
    const model = scene.clone(true)
    const materials: MeshStandardMaterial[] = []
    const lights: Light[] = []
    model.traverse(object => {
      // Asset preview lighting must not contaminate the room's lighting design.
      if (object instanceof Light) lights.push(object)
      if (!(object instanceof Mesh)) return
      object.castShadow = object.receiveShadow = true
      const finish = (original: MeshStandardMaterial) => {
        const material = original.clone()
        if (asset.id === 'sofa' && material instanceof MeshPhysicalMaterial && material.name.includes('fabric')) {
          material.color.set('#c9bca5')
          material.sheenColor.set('#cbbba0')
          material.sheen = .65
          material.sheenRoughness = .85
          material.specularColor.set('#ffffff')
          material.specularIntensity = .25
          material.roughness = .88
          material.normalScale.set(.12, .12)
        }
        // Poly Haven's ARM maps carry AO in R; some exports omit the AO binding.
        if (!material.aoMap && material.roughnessMap?.name.includes('_arm_')) material.aoMap = material.roughnessMap
        material.aoMapIntensity = .8
        materials.push(material)
        return material
      }
      object.material = Array.isArray(object.material) ? object.material.map(finish) : finish(object.material)
    })
    lights.forEach(light => light.removeFromParent())
    const aligned = new Group()
    model.rotation.y = asset.modelRotation || 0
    aligned.add(model)
    aligned.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(aligned)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const scale = Math.min(asset.size[0] / size.x, asset.size[1] / size.y, asset.size[2] / size.z)
    aligned.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    aligned.scale.setScalar(scale)
    return { aligned, materials }
  }, [scene, asset])
  useEffect(() => () => prepared.materials.forEach(material => material.dispose()), [prepared])
  return <group name={`showcase-${asset.id}`} position={asset.position} rotation={[0, asset.rotation || 0, 0]} dispose={null}><primitive object={prepared.aligned} /></group>
}

export default function ShowcaseFurniture() {
  return <>{showcaseAssets.map(asset => <Asset key={asset.id} asset={asset} />)}</>
}
