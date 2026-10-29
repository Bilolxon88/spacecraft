import { Component, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useThree } from '@react-three/fiber'

export function LoadingModel({ failed = false }: { failed?: boolean }) {
  const { gl } = useThree()
  useEffect(() => {
    if (failed) gl.domElement.dispatchEvent(new CustomEvent('model-unavailable', { bubbles: true }))
  }, [failed, gl])
  return <mesh position={[0, .5, 0]} name={failed ? 'unavailable-model' : 'loading-model'}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={failed ? '#cc9a60' : '#c3bcae'} wireframe transparent opacity={.35} /></mesh>
}

export class ModelLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <LoadingModel failed /> : this.props.children }
}
