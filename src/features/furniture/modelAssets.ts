export type ModelAsset = { url: string; rotation?: number; primary: string; thumbnail?: string }
const showcase = '/assets/showcase/'
export const modelAssets: Record<string, ModelAsset> = {
  sofa: { url: showcase + 'GlamVelvetSofa/model.glb', primary: 'fabric', thumbnail: '/assets/editor/thumbnails/sofa.png' },
  loveseat: { url: showcase + 'GlamVelvetSofa/model.glb', primary: 'fabric', thumbnail: '/assets/editor/thumbnails/sofa.png' },
  armchair: { url: showcase + 'modern_arm_chair_01/model.gltf', primary: 'pillow', thumbnail: '/assets/editor/thumbnails/modern_arm_chair_01.webp' },
  'coffee-table': { url: showcase + 'modern_coffee_table_01/model.gltf', rotation: Math.PI / 2, primary: 'modern_coffee_table', thumbnail: '/assets/editor/thumbnails/modern_coffee_table_01.webp' },
  plant: { url: showcase + 'potted_plant_02/model.gltf', primary: 'leaves', thumbnail: '/assets/editor/thumbnails/potted_plant_02.webp' },
  vase: { url: showcase + 'ceramic_vase_01/model.gltf', primary: 'ceramic', thumbnail: '/assets/editor/thumbnails/ceramic_vase_01.webp' },
  'round-table': { url: '/assets/editor/side_table_01/model.gltf', primary: 'side_table', thumbnail: '/assets/editor/side_table_01/thumbnail.webp' },
  'low-shelf': { url: '/assets/editor/modern_wooden_cabinet/model.gltf', primary: 'modern_wooden_cabinet', thumbnail: '/assets/editor/modern_wooden_cabinet/thumbnail.webp' },
  sideboard: { url: '/assets/editor/modern_wooden_cabinet/model.gltf', primary: 'modern_wooden_cabinet', thumbnail: '/assets/editor/modern_wooden_cabinet/thumbnail.webp' },
  bookshelf: { url: '/assets/editor/drawer_cabinet/model.gltf', primary: 'drawer_cabinet', thumbnail: '/assets/editor/drawer_cabinet/thumbnail.webp' },
  desk: { url: '/assets/editor/metal_office_desk/model.gltf', primary: 'metal_office_desk', thumbnail: '/assets/editor/metal_office_desk/thumbnail.webp' },
  'dining-chair': { url: '/assets/editor/dining_chair_02/model.gltf', primary: 'dining_chair', thumbnail: '/assets/editor/dining_chair_02/thumbnail.webp' },
  'accent-chair': { url: '/assets/editor/mid_century_lounge_chair/model.gltf', primary: 'mid_century', thumbnail: '/assets/editor/mid_century_lounge_chair/thumbnail.webp' },
  'stone-coffee-table': { url: '/assets/editor/coffee_table_round_01/model.gltf', primary: 'coffee_table_round', thumbnail: '/assets/editor/coffee_table_round_01/thumbnail.webp' },
  pendant: { url: showcase + 'modern_ceiling_lamp_01/model.gltf', primary: 'modern_ceiling_lamp_01', thumbnail: '/assets/editor/thumbnails/pendant.png' },
}

