import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, RoundedBox } from '@react-three/drei'
import { MathUtils, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Vector2 } from 'three'
import type { MotionValue } from 'motion/react'
import { entrance } from './journeyPath'
import { assetRoot } from './showcaseAssets'

function useSurface(id: string, repeat: [number, number], anisotropy: number, colored = true) {
  const source = useTexture((colored ? ['color', 'normal', 'roughness', 'ao'] : ['normal', 'roughness', 'ao']).map(map => `${assetRoot}${id}/${map}.jpg`))
  const [x, y] = repeat
  const maps = useMemo(() => source.map((original, index) => {
    const texture = original.clone()
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(x, y)
    texture.anisotropy = anisotropy
    if (colored && index === 0) texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }), [source, x, y, anisotropy, colored])
  useEffect(() => () => maps.forEach(texture => texture.dispose()), [maps])
  const offset = colored ? 1 : 0
  return { map: colored ? maps[0] : null, normalMap: maps[offset], roughnessMap: maps[offset + 1], aoMap: maps[offset + 2] }
}

export default function ShowcaseArchitecture({ progress, reducedMotion, anisotropy }: { progress: MotionValue<number>; reducedMotion: boolean; anisotropy: number }) {
  // Published physical scan sizes: oak 1.7m, plaster 1m, weave 0.4m.
  const oak = useSurface('wood_floor', [5.12 / 1.7, 5.12 / 1.7], anisotropy)
  const plaster = useSurface('white_plaster_02', [5, 2.8], anisotropy, false)
  const fabric = useSurface('fabric_pattern_07', [2.3 / .4, 1.6 / .4], anisotropy, false)
  const wall = useMemo(() => new MeshStandardMaterial({ normalMap: plaster.normalMap, roughnessMap: plaster.roughnessMap, color: '#e6dfd2', roughness: .95, normalScale: new Vector2(.035, .035) }), [plaster.normalMap, plaster.roughnessMap])
  const roof = useRef<Mesh>(null)
  const facade = useMemo(() => { const material = wall.clone(); material.transparent = true; return material }, [wall])
  const ceiling = useMemo(() => { const material = wall.clone(); material.transparent = true; return material }, [wall])
  useEffect(() => () => { wall.dispose(); facade.dispose(); ceiling.dispose() }, [wall, facade, ceiling])
  useFrame(() => {
    const p = reducedMotion ? 0 : progress.get()
    facade.opacity = MathUtils.lerp(.08, 1, MathUtils.smoothstep(p, .12, .38))
    facade.depthWrite = facade.opacity > .95
    ceiling.opacity = MathUtils.smoothstep(p, .3, .46)
    ceiling.depthWrite = ceiling.opacity > .95
    if (roof.current) roof.current.castShadow = ceiling.opacity > .95
  })
  const block = (position: [number, number, number], size: [number, number, number], material = wall, shadow = true) => <mesh position={position} material={material} castShadow={shadow} receiveShadow><boxGeometry args={size} /></mesh>
  const pierWidth = (5 - entrance.width) / 2
  return <>
    <mesh position={[0, -.1, 0]} receiveShadow><boxGeometry args={[5.16, .2, 5.16]} /><meshStandardMaterial color="#8c7152" roughness={.8} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .001, 0]} receiveShadow><planeGeometry args={[5.12, 5.12]} /><meshStandardMaterial {...oak} roughness={.85} normalScale={[.3, .3]} aoMapIntensity={.45} /></mesh>
    {block([0, 1.4, -2.55], [5.12, 2.8, .12])}
    {block([-2.55, 1.4, 0], [.12, 2.8, 5.12])}
    {/* Right facade has a real 2.7m-wide window, not a luminous wall decal. */}
    {block([2.55, .4, 0], [.12, .8, 5.12], facade)}
    {block([2.55, 2.67, 0], [.12, .26, 5.12], facade)}
    {[-1, 1].map(sign => <group key={sign}>{block([2.55, 1.67, sign * 1.955], [.12, 1.74, 1.21], facade)}</group>)}
    {[-1, 1].map(sign => <group key={sign}>{block([sign * (entrance.width / 2 + pierWidth / 2), 1.4, entrance.z], [pierWidth, 2.8, entrance.thickness], facade)}</group>)}
    {block([0, (2.8 + entrance.height) / 2, entrance.z], [entrance.width, 2.8 - entrance.height, entrance.thickness], facade)}
    <mesh ref={roof} position={[0, 2.86, 0]} material={ceiling} receiveShadow><boxGeometry args={[5.12, .12, 5.12]} /></mesh>
    {[-1, 1].map(sign => <mesh key={sign} position={[sign * .825, entrance.height / 2, entrance.z]}><boxGeometry args={[.05, entrance.height, .18]} /><meshStandardMaterial color="#9b8061" roughness={.65} /></mesh>)}
    <mesh position={[0, entrance.height + .025, entrance.z]}><boxGeometry args={[1.7, .05, .18]} /><meshStandardMaterial color="#9b8061" roughness={.65} /></mesh>
    {/* Slim dark bronze window profiles; glass reflects the HDR without transmission passes. */}
    {[-1.36, 0, 1.36].map(z => <mesh key={z} position={[2.49, 1.67, z]} castShadow><boxGeometry args={[.08, 1.78, .035]} /><meshStandardMaterial color="#363630" metalness={.7} roughness={.38} /></mesh>)}
    {[.8, 2.54].map(y => <mesh key={y} position={[2.49, y, 0]} castShadow><boxGeometry args={[.08, .035, 2.76]} /><meshStandardMaterial color="#363630" metalness={.7} roughness={.38} /></mesh>)}
    <mesh position={[2.54, 1.67, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[2.7, 1.72]} /><meshPhysicalMaterial color="#e1e9e5" transparent opacity={.1} roughness={.08} metalness={.2} depthWrite={false} /></mesh>
    <mesh position={[2.47, .78, 0]} receiveShadow><boxGeometry args={[.24, .05, 2.85]} /><meshStandardMaterial color="#d1c7b4" roughness={.7} /></mesh>
    {block([0, .055, -2.47], [5, .11, .04])}
    {block([-2.47, .055, 0], [.04, .11, 5])}
    {/* Dense woven normal/AO maps supply fibre detail; neutral dye replaces the source's red pattern. */}
    <RoundedBox args={[2.3, .025, 1.6]} radius={.012} smoothness={2} position={[0, .018, 0]} receiveShadow>
      <meshPhysicalMaterial color="#c7bba3" normalMap={fabric.normalMap} normalScale={[.5, .5]} roughnessMap={fabric.roughnessMap} aoMap={fabric.aoMap} aoMapIntensity={.3} roughness={1} sheen={.4} sheenColor="#e5dac4" sheenRoughness={1} />
    </RoundedBox>
    {/* Bespoke oak joinery, separate from the editor's asset catalog. */}
    <group position={[-2.18, 0, -.05]}>
      {[.12, .51, .9].map(y => <RoundedBox key={y} args={[.42, .045, 1.65]} radius={.008} smoothness={2} position={[0, y, 0]} castShadow receiveShadow><meshStandardMaterial {...oak} color="#b2a18b" roughness={.75} normalScale={[.1, .1]} /></RoundedBox>)}
      {[-.79, .79].map(z => <mesh key={z} position={[0, .5, z]} castShadow><boxGeometry args={[.4, .8, .03]} /><meshStandardMaterial color="#48433a" roughness={.5} metalness={.35} /></mesh>)}
    </group>
    {/* A pair of restrained architectural relief panels gives the back wall depth. */}
    {[-.59, .59].map((x, index) => <group key={x} position={[x, 1.78, -2.465]}>
      <RoundedBox args={[.92, .94, .035]} radius={.006} smoothness={2} castShadow><meshStandardMaterial color="#806d57" roughness={.75} /></RoundedBox>
      <mesh position={[0, 0, .025]}><planeGeometry args={[.86, .88]} /><meshStandardMaterial color={index ? '#b8ac94' : '#d7cdb9'} roughness={1} /></mesh>
      <mesh position={[index ? -.12 : .12, 0, .045]} rotation={[0, 0, index ? .5 : -.7]} castShadow><torusGeometry args={[.23, .045, 12, 64, Math.PI * 1.6]} /><meshStandardMaterial color={index ? '#d7cdb9' : '#a28d70'} roughness={.95} /></mesh>
    </group>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.205, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#252621" roughness={1} /></mesh>
  </>
}

