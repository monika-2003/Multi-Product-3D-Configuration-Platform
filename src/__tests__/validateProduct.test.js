import { validateCatalog, validateProduct } from '../catalog/validateProduct.js';
import { PRODUCTS } from '../catalog/products.js';

const validProduct = {
  id: 'chair',
  name: 'Chair',
  modelUrl: 'https://example.com/chair.glb',
  color: '#8a8a8a',
  scale: 1,
  camera: { fov: 45, position: [0, 0, 3] },
  featureFlags: { allowColor: true, allowScale: true, allowCamera: true },
};

describe('validateProduct', () => {
  test('accepts a complete product', () => {
    expect(validateProduct(validProduct)).toEqual({ ok: true, errors: [] });
  });

  test('fails when id or modelUrl is missing', () => {
    const result = validateProduct({ ...validProduct, id: '', modelUrl: '' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('id is required');
    expect(result.errors).toContain('modelUrl is required');
  });

  test('fails when color is not hex', () => {
    const result = validateProduct({ ...validProduct, color: 'red' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('color must be a hex string like #8a8a8a');
  });

  test('fails when camera position is not [x, y, z]', () => {
    const result = validateProduct({
      ...validProduct,
      camera: { fov: 45, position: [0, 1] },
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('camera.position must be [x, y, z]');
  });
});

describe('validateCatalog', () => {
  test('accepts the real product catalog', () => {
    expect(validateCatalog(PRODUCTS).ok).toBe(true);
  });

  test('fails on an empty catalog', () => {
    const result = validateCatalog([]);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Catalog must have at least one product');
  });

  test('fails on duplicate ids', () => {
    const result = validateCatalog([validProduct, { ...validProduct, name: 'Copy' }]);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Duplicate product id: chair');
  });
});
