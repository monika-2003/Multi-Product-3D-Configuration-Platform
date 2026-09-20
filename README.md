# Multi-Product 3D Config Platform

A small React app that renders **any number of products from a catalog**. Switch products in the UI, live-edit color/scale/camera, and share a specific product with a URL.

This is the same idea as one template running across many brand campaigns: core code stays the same, only the config changes.

## Setup

Needs Node 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm test           # Jest: reducer, catalog validation, editor form
npm run build
npm run preview
```

## How to add a product

Edit only [`src/catalog/products.js`](src/catalog/products.js). Append an object:

```js
{
  id: 'chair',                 // used in the URL: /?product=chair
  name: 'Lounge Chair',
  modelUrl: 'https://.../chair.glb',
  color: '#8a8a8a',
  scale: 1,
  camera: { fov: 45, position: [0, 0, 3] },
  featureFlags: {
    allowColor: true,
    allowScale: true,
    allowCamera: true,
  },
}
```

You do **not** change the switcher, editor, or 3D viewer. They already loop over this array.

## What the app does

- Left: GLB model with orbit + zoom, plus a loading overlay
- Right: product buttons and a live config form
- URL stays in sync, for example `/?product=helmet`
- Feature flags hide editor fields (Duck has no camera editor, Boom Box has no color picker)

## State management and component architecture

I kept 3D and product identity out of the same layer.

**Catalog** (`src/catalog/products.js`) is data. Core components never mention "helmet" or "duck". A new campaign product is a new config object, including feature flags for which editor fields that brand is allowed to touch.

**State** is one `useReducer` inside `ProductProvider`: selected product, loading, and the live editor draft. Those values change together (select product → reset draft + show loading). Scattered `useState` would make that easy to get wrong. The reducer is a plain function, so tests do not need React.

**Why not Redux?** The app is small. Context + `useReducer` is enough and easier to explain. Switcher, editor, and viewer all need the same state; context avoids a long prop chain without adding a store library.

**URL** (`/?product=helmet`) is a production requirement, not a 3D one. Read/write lives in `ProductProvider`, not in the reducer, so back/forward and unit tests stay simple.

```
src/
  catalog/products.js         ← add products here
  catalog/validateProduct.js
  state/productReducer.js
  state/ProductProvider.jsx   ← reducer + URL sync
  components/ProductSwitcher.jsx
  components/ConfigEditor.jsx
  components/ProductViewer.jsx
```

**Why this is extensible:** a fourth product, a new flag (`allowMaterial` later), or a different default camera is catalog data. The viewer stays a generic GLB + color + scale + camera component. Tests cover the reducer and validation, not WebGL pixels.

## React performance

Three.js re-renders are expensive. The decision was to **keep the canvas still unless the model or its draft actually changed**.

1. **`React.memo` on `ProductViewer`.** The loading overlay lives in `App`, so toggling `isModelLoading` does not rebuild the WebGL canvas. The viewer only re-renders when `modelUrl`, `color`, `scale`, or `camera` change.
2. **`React.lazy`** splits the three.js bundle out of the first page load. The editor HTML can appear before the viewer chunk arrives.
3. **Clone the GLTF scene and its materials** before tinting, so colour edits do not mutate the cached model.

If I had more time I would measure:

- Network panel: first-load JS with and without the lazy viewer chunk
- Performance panel while dragging orbit: main thread vs GPU, damping cost
- Time to first framed model after a product switch (GLB fetch + decode + `Box3` fit)
- React Profiler while typing in the color field, to confirm the canvas is not in that render

Tests cover logic, not the GPU: reducer, config validation, and the editor form (Jest + Testing Library).

## How I approached the 3D portion

I do not have a prior Three.js background. I used **React Three Fiber** so the scene could stay a React tree (`Canvas`, `Suspense`, lights as components) instead of a `new THREE.Scene()` script I would have to learn from scratch.

**What I figured out myself:**

- Catalog-driven products, one reducer, URL as shareable state, memo/lazy around the canvas. That is the architecture I would defend.
- Remounting `OrbitControls` and the camera when `modelUrl` changes, so the previous product's orbit/zoom is not kept.
- Why models looked huge: a detached clone often reports an empty bounding box. I had to measure after the object was in the scene, then center and fit it. That was a debugging problem, not a copy-paste.

**Where I leaned on AI and docs:**

- APIs I had not used: `useGLTF`, `OrbitControls`, cloning meshes/materials, `Box3` / `Vector3` for framing
- Lighting defaults that make a GLB readable without a full studio setup

I used AI the same way I do at work: fast on unfamiliar APIs, slow on structure. The interesting part of this task was not writing a shader. It was keeping the 3D viewer generic so the catalog can grow.

## Deploy and cache in production

`vite build` emits a static site. I would host `dist/` on Cloudflare Pages, Netlify, or S3 + CloudFront.

Hashed files under `/assets/` get `Cache-Control: public, max-age=31536000, immutable`. `index.html` stays short-cache or no-cache so a new deploy is picked up.

GLBs currently load from jsDelivr (Khronos sample models). In production I would put those files on the same CDN as the app, with a long cache and a versioned path, so a campaign is not coupled to a third-party URL. The shareable `?product=` link still works because it is only a query param on a static page.
