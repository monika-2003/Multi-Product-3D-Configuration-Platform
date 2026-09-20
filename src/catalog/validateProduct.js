/**
 * Checks that a product config (and the full catalog) has the fields
 * the app expects. Used on load and in unit tests.
 */

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function validateProduct(product) {
  const errors = [];

  if (!product || typeof product !== 'object') {
    return { ok: false, errors: ['Product must be an object'] };
  }

  if (!product.id || typeof product.id !== 'string') {
    errors.push('id is required');
  }
  if (!product.name || typeof product.name !== 'string') {
    errors.push('name is required');
  }
  if (!product.modelUrl || typeof product.modelUrl !== 'string') {
    errors.push('modelUrl is required');
  }
  if (!isHexColor(product.color)) {
    errors.push('color must be a hex string like #8a8a8a');
  }
  if (typeof product.scale !== 'number' || product.scale <= 0) {
    errors.push('scale must be a positive number');
  }
  if (!product.camera || typeof product.camera.fov !== 'number') {
    errors.push('camera.fov is required');
  }
  if (!Array.isArray(product.camera?.position) || product.camera.position.length !== 3) {
    errors.push('camera.position must be [x, y, z]');
  }
  if (!product.featureFlags || typeof product.featureFlags !== 'object') {
    errors.push('featureFlags is required');
  }

  return { ok: errors.length === 0, errors };
}

export function validateCatalog(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return { ok: false, errors: ['Catalog must have at least one product'] };
  }

  const errors = [];
  const ids = new Set();

  products.forEach((product, index) => {
    const result = validateProduct(product);
    if (!result.ok) {
      errors.push(`Product ${index}: ${result.errors.join(', ')}`);
    }
    if (product?.id) {
      if (ids.has(product.id)) {
        errors.push(`Duplicate product id: ${product.id}`);
      }
      ids.add(product.id);
    }
  });

  return { ok: errors.length === 0, errors };
}
