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
    color: '#e6c84f',
    scale: 1,
    camera: { fov: 45, position: [0, 0.2, 5] },
    // Same editor template, fewer controls — like a simpler brand campaign.
    featureFlags: {
      allowColor: true,
      allowScale: true,
      allowCamera: false,
    },
  },
  {
    id: 'boombox',
    name: 'Boom Box',
    modelUrl:
      'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
    // Keep white so the original textures show. Color picker is hidden.
    color: '#ffffff',
    scale: 1,
    camera: { fov: 45, position: [0, 0.2, 5] },
    featureFlags: {
      allowColor: false,
      allowScale: true,
      allowCamera: true,
    },
  },
];

const catalogCheck = validateCatalog(PRODUCTS);
if (!catalogCheck.ok) {
  console.error('Invalid product catalog:', catalogCheck.errors);
}
