import { useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { RepeatWrapping, SRGBColorSpace } from 'three'
import type { Surface } from '../../types/project'
import { materials } from '../furniture/catalog'

export function usePbrMaps(base: string, repeatX: number, repeatY: number) {
  const loaded = useTexture(['color', 'normal', 'roughness', 'ao'].map(name => `${base}/${name}.jpg`))
  const textures = useMemo(() => loaded.map((source, index) => {
    const texture = source.clone()
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(repeatX, repeatY)
    texture.anisotropy = 4
    if (index === 0) texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }), [loaded, repeatX, repeatY])
  useEffect(() => () => textures.forEach(texture => texture.dispose()), [textures])
  return { map: textures[0], normalMap: textures[1], roughnessMap: textures[2], aoMap: textures[3] }
}

export function PbrFloor({ surface, width, length }: { surface: Surface; width: number; length: number }) {
  const base = surface.preset === 'marble' ? '/assets/editor/marble_01' : surface.preset === 'concrete' ? '/assets/editor/concrete_wall_009' : '/assets/showcase/wood_floor'
  const tile = surface.preset === 'oak' || surface.preset === 'walnut' ? 1.7 : 2
  const maps = usePbrMaps(base, width / tile, length / tile)
  const wood = surface.preset === 'oak' || surface.preset === 'walnut'
  const tint = surface.color === materials[surface.preset].color && surface.preset !== 'walnut' ? '#ffffff' : surface.color
  return <>
    <mesh position={[0, -.09, 0]} receiveShadow><boxGeometry args={[width + .15, .18, length + .15]} /><meshStandardMaterial color="#8c7356" roughness={.8} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .001, 0]} receiveShadow>
      <planeGeometry args={[width + .15, length + .15]} />
      <meshStandardMaterial {...maps} color={tint} roughness={surface.roughness} metalness={surface.metalness} normalScale={wood ? [.28, .28] : [.12, .12]} aoMapIntensity={.5} />
    </mesh>
  </>
}

export function WovenRug({ surface }: { surface: Surface }) {
  const loaded = useTexture(['/assets/showcase/fabric_pattern_07/normal.jpg', '/assets/showcase/fabric_pattern_07/roughness.jpg', '/assets/showcase/fabric_pattern_07/ao.jpg'])
  return <mesh position={[0, .5, 0]} receiveShadow><boxGeometry args={[1, 1, 1]} /><meshPhysicalMaterial color={surface.color} normalMap={loaded[0]} normalScale={[.35, .35]} roughnessMap={loaded[1]} aoMap={loaded[2]} aoMapIntensity={.3} roughness={surface.roughness} metalness={surface.metalness} sheen={.3} sheenColor={surface.color} sheenRoughness={1} /></mesh>
}
