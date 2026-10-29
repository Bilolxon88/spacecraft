import { Component, Suspense, useEffect, useMemo } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { ACESFilmicToneMapping, Box3, MathUtils, PCFSoftShadowMap, SRGBColorSpace, Vector3 } from 'three'
import type { MotionValue } from 'motion/react'
import { usePreferences } from '../../stores/preferences'
import { journeyPose } from './journeyPath'
import { assetRoot, showcaseQuality } from './showcaseAssets'
import ShowcaseArchitecture from './ShowcaseArchitecture'
import ShowcaseFurniture from './ShowcaseFurniture'

function JourneyCamera({ progress, reducedMotion, stage, onReady }: { progress: MotionValue<number>; reducedMotion: boolean; stage: RefObject<HTMLDivElement | null>; onReady: () => void }) {
  const { camera, size, invalidate, gl, scene } = useThree()
  const vectors = useMemo(() => ({ position: new Vector3(), target: new Vector3() }), [])
  useEffect(() => progress.on('change', () => invalidate()), [progress, invalidate])
  useEffect(() => { invalidate() }, [reducedMotion, size.width, size.height, invalidate])
  useEffect(() => { gl.toneMappingExposure = 1.1 }, [gl])
  useEffect(() => {
    scene.updateMatrixWorld(true)
    const bounds: { name: string; min: number[]; max: number[] }[] = []
    scene.traverse(object => {
      if (!object.name.startsWith('showcase-')) return
      const box = new Box3().setFromObject(object)
      bounds.push({ name: object.name, min: box.min.toArray(), max: box.max.toArray() })
    })
    if (stage.current) stage.current.dataset.assetBounds = JSON.stringify(bounds)
    onReady()
  }, [scene, stage, onReady])
  useFrame(() => {
    const p = reducedMotion ? 0 : MathUtils.clamp(progress.get(), 0, 1)
    const pose = journeyPose(p, vectors.position, vectors.target)
    camera.position.copy(pose.position)
    camera.up.set(0, 1, 0); camera.lookAt(pose.target)
    if ('fov' in camera) {
      const reveal = MathUtils.smoothstep(p, .04, .25)
      const portrait = size.width / size.height < 1
      camera.fov = MathUtils.lerp(portrait ? 58 : 42, portrait ? 68 : 62, MathUtils.smoothstep(p, .15, .48))
      // Off-axis framing places the initial overview beside the existing hero copy.
      camera.setViewOffset(size.width, size.height, portrait || reducedMotion ? 0 : -size.width * .22 * (1 - reveal), 0, size.width, size.height)
      camera.updateProjectionMatrix()
    }
    // Read-only frame metadata supports integration checks against the actual renderer camera.
    if (stage.current) {
      stage.current.dataset.cameraPosition = camera.position.toArray().map(value => value.toFixed(4)).join(',')
      stage.current.dataset.cameraTarget = pose.target.toArray().map(value => value.toFixed(4)).join(',')
      stage.current.dataset.cameraProgress = p.toFixed(4)
      stage.current.dataset.rendered = 'true'
      stage.current.dataset.triangles = String(gl.info.render.triangles)
      stage.current.dataset.drawCalls = String(gl.info.render.calls)
    }
  })
  return null
}

class RenderBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function JourneyScene({ progress, reducedMotion, stage, onFailure, onReady }: { progress: MotionValue<number>; reducedMotion: boolean; stage: RefObject<HTMLDivElement | null>; onFailure: () => void; onReady: () => void }) {
  const quality = usePreferences(state => state.quality)
  const settings = showcaseQuality[quality]
  return <RenderBoundary onFailure={onFailure}><Canvas frameloop="demand" dpr={[1, settings.dpr]} shadows={{ type: PCFSoftShadowMap }} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }} camera={{ position: [7, 6.2, 8.8], fov: 42, near: .04, far: 100 }} aria-label="3D room: scroll to travel through the entrance and explore the interior">
    <color attach="background" args={['#252621']} />
    <Suspense fallback={null}>
      <Environment files={`${assetRoot}artist_workshop/environment.hdr`} environmentIntensity={.85} environmentRotation={[0, Math.PI / 2, 0]} />
      <hemisphereLight args={['#eef3ff', '#a28a6d', .25]} />
      <directionalLight position={[6, 5, 2]} color="#fff2dd" intensity={1.8} castShadow shadow-mapSize={[settings.shadowSize, settings.shadowSize]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={.5} shadow-camera-far={20} shadow-normalBias={.015} shadow-bias={-.00015} />
      <pointLight position={[.3, 2.2, -.3]} color="#ffdfb5" intensity={2} distance={4} decay={2} />
      <ShowcaseArchitecture progress={progress} reducedMotion={reducedMotion} anisotropy={settings.anisotropy} />
      <ShowcaseFurniture />
      {settings.contact && <ContactShadows position={[0, .006, 0]} scale={5.1} opacity={.45} blur={2.2} far={.7} resolution={512} frames={1} color="#443829" />}
      <JourneyCamera progress={progress} reducedMotion={reducedMotion} stage={stage} onReady={onReady} />
    </Suspense>
  </Canvas></RenderBoundary>
}
