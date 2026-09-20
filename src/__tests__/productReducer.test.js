import {
  createInitialState,
  productReducer,
} from '../state/productReducer.js';

const catalog = [
  {
    id: 'a',
    name: 'Product A',
    modelUrl: 'a.glb',
    color: '#111111',
    scale: 1,
    camera: { fov: 45, position: [0, 0, 3] },
    featureFlags: { allowColor: true, allowScale: true, allowCamera: true },
  },
  {
    id: 'b',
    name: 'Product B',
    modelUrl: 'b.glb',
    color: '#ffffff',
    scale: 2,
    camera: { fov: 50, position: [1, 1, 4] },
    featureFlags: { allowColor: true, allowScale: true, allowCamera: false },
  },
];

function init(urlProductId) {
  return createInitialState({ products: catalog, urlProductId });
}

describe('productReducer', () => {
  test('starts from the product id in the URL', () => {
    const state = init('b');
    expect(state.activeProductId).toBe('b');
    expect(state.draft.color).toBe('#ffffff');
    expect(state.draft.scale).toBe(2);
    expect(state.isModelLoading).toBe(true);
  });

  test('falls back to the first product when the URL id is unknown', () => {
    const state = init('missing');
    expect(state.activeProductId).toBe('a');
    expect(state.draft.color).toBe('#111111');
  });

  test('SELECT_PRODUCT resets draft to that product defaults', () => {
    const selected = productReducer(init('a'), { type: 'SELECT_PRODUCT', id: 'b' });
    expect(selected.activeProductId).toBe('b');
    expect(selected.draft).toEqual({
      color: '#ffffff',
      scale: 2,
      camera: { fov: 50, position: [1, 1, 4] },
    });
    expect(selected.isModelLoading).toBe(true);
  });

  test('SELECT_PRODUCT ignores an unknown id', () => {
    const start = init('a');
    const next = productReducer(start, { type: 'SELECT_PRODUCT', id: 'nope' });
    expect(next).toBe(start);
  });

  test('SELECT_PRODUCT ignores the already selected id', () => {
    const edited = productReducer(init('a'), {
      type: 'UPDATE_DRAFT',
      patch: { color: '#ff0000' },
    });
    const next = productReducer(edited, { type: 'SELECT_PRODUCT', id: 'a' });
    expect(next).toBe(edited);
    expect(next.draft.color).toBe('#ff0000');
  });

  test('UPDATE_DRAFT patches color and scale', () => {
    const next = productReducer(init('a'), {
      type: 'UPDATE_DRAFT',
      patch: { color: '#ff0000', scale: 1.5 },
    });
    expect(next.draft.color).toBe('#ff0000');
    expect(next.draft.scale).toBe(1.5);
    expect(next.draft.camera.fov).toBe(45);
  });

  test('UPDATE_DRAFT merges camera fields', () => {
    const next = productReducer(init('a'), {
      type: 'UPDATE_DRAFT',
      patch: { camera: { fov: 60 } },
    });
    expect(next.draft.camera.fov).toBe(60);
    expect(next.draft.camera.position).toEqual([0, 0, 3]);
  });

  test('RESET_DRAFT restores catalog defaults', () => {
    const edited = productReducer(init('a'), {
      type: 'UPDATE_DRAFT',
      patch: { color: '#00ff00', scale: 9 },
    });
    const reset = productReducer(edited, { type: 'RESET_DRAFT' });
    expect(reset.draft.color).toBe('#111111');
    expect(reset.draft.scale).toBe(1);
  });

  test('SET_LOADING toggles the loading flag', () => {
    const next = productReducer(init('a'), {
      type: 'SET_LOADING',
      isModelLoading: false,
    });
    expect(next.isModelLoading).toBe(false);
  });
});
