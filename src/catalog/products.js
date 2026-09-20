/**
 * Product catalog.
 *
 * This is the only file you need to edit to add a new product.
 * The rest of the app (switcher, editor, 3D viewer) already loops over
 * this list — they never hardcode product names.
 */
import { validateCatalog } from './validateProduct.js';

export const PRODUCTS = [
  {
    id: 'helmet',
    name: 'Studio Helmet',
    modelUrl:
      'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    color: '#c4a574',
    colorMode: 'tint',
    scale: 1,
    camera: { fov: 45, position: [0, 0.2, 5] },
    featureFlags: {
      allowColor: true,
      allowScale: true,
      allowCamera: true,
    },
  },
  {
    id: 'duck',
    name: 'Classic Duck',
    modelUrl:
      'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Duck/glTF-Binary/Duck.glb',
    // Tint multiplies your hex over the texture — eyes stay black in the PNG.
    color: '#ffffff',
    colorMode: 'tint',
    scale: 1,
    camera: { fov: 45, position: [0, 0.2, 5] },
    featureFlags: {
      allowColor: true,
      allowScale: true,
      allowCamera: true,
    },
  },
  {
    id: 'boombox',
    name: 'Boom Box',
    modelUrl:
      'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
    color: '#ffffff',
    // White tints textures; maps stay so labels and metal detail remain.
    colorMode: 'tint',
    scale: 1,
    camera: { fov: 45, position: [0, 0.2, 5] },
    featureFlags: {
      allowColor: true,
      allowScale: true,
      allowCamera: true,
    },
  },
];

const catalogCheck = validateCatalog(PRODUCTS);
if (!catalogCheck.ok) {
  console.error('Invalid product catalog:', catalogCheck.errors);
}
