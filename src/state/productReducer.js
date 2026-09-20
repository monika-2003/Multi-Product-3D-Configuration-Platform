/**
 * All product UI state lives here: which product is selected, whether
 * the model is loading, and the live editor values (draft).
 *
 * Why a reducer instead of many useState calls?
 * Selecting a product always resets the draft and loading flag together.
 * One function makes that easy to test (no React, no URL, no DOM).
 */

export function draftFromProduct(product) {
  return {
    color: product.color,
    scale: product.scale,
    camera: {
      fov: product.camera.fov,
      position: [...product.camera.position],
    },
  };
}

export function getProductById(products, id) {
  return products.find((product) => product.id === id) || products[0];
}

export function getActiveProduct(state) {
  return getProductById(state.products, state.activeProductId);
}

export function createInitialState({ products, urlProductId }) {
  const product = getProductById(products, urlProductId);
  return {
    products,
    activeProductId: product.id,
    isModelLoading: true,
    draft: draftFromProduct(product),
  };
}

export function productReducer(state, action) {
  switch (action.type) {
    case 'SELECT_PRODUCT': {
      const product = state.products.find((item) => item.id === action.id);
      // Unknown ids are ignored so a bad URL does not wipe the current view.
      // Same id is ignored so URL sync does not reset live editor values.
      if (!product || product.id === state.activeProductId) {
        return state;
      }
      return {
        ...state,
        activeProductId: product.id,
        isModelLoading: true,
        draft: draftFromProduct(product),
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isModelLoading: action.isModelLoading,
      };

    case 'UPDATE_DRAFT': {
      const patch = action.patch || {};
      return {
        ...state,
        draft: {
          ...state.draft,
          ...patch,
          camera: patch.camera
            ? { ...state.draft.camera, ...patch.camera }
            : state.draft.camera,
        },
      };
    }

    case 'RESET_DRAFT': {
      const product = getActiveProduct(state);
      return {
        ...state,
        draft: draftFromProduct(product),
      };
    }

    default:
      return state;
  }
}
