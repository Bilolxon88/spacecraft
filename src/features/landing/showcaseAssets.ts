export type ShowcaseAsset = {
  id: string
  file: string
  position: [number, number, number]
  size: [number, number, number]
  rotation?: number
  modelRotation?: number
}

// Footprints stay within the original living-room layout. Model proportions are
// preserved by uniform fitting, never stretched to fill these bounding boxes.
export const showcaseAssets: ShowcaseAsset[] = [
  { id: 'sofa', file: 'GlamVelvetSofa/model.glb', position: [0, 0, -1.65], size: [2.3, .9, 1.05] },
  { id: 'armchair', file: 'modern_arm_chair_01/model.gltf', position: [1.6, 0, .5], size: [.85, 1.03, .83], rotation: -Math.PI / 4 },
  { id: 'coffee-table', file: 'modern_coffee_table_01/model.gltf', position: [0, .025, -.1], size: [1.15, .39, .65], modelRotation: Math.PI / 2 },
  { id: 'plant', file: 'potted_plant_02/model.gltf', position: [1.9, 0, -1.9], size: [.7, 1, .7] },
  { id: 'pendant', file: 'modern_ceiling_lamp_01/model.gltf', position: [.3, 2.05, -.3], size: [.34, .75, .34] },
  { id: 'vase', file: 'ceramic_vase_01/model.gltf', position: [.25, .4, -.15], size: [.13, .25, .13] },
]

export const showcaseQuality = {
  low: { dpr: 1, shadowSize: 512, contact: false, anisotropy: 2 },
  medium: { dpr: 1.5, shadowSize: 1024, contact: true, anisotropy: 4 },
  high: { dpr: 2, shadowSize: 2048, contact: true, anisotropy: 8 },
} as const

export const assetRoot = '/assets/showcase/'
