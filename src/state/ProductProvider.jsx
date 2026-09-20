/**
 * Provides product state to the app and keeps the selected product in the URL.
 *
 * Why context? Switcher, editor, and viewer all need the same state.
 * Context avoids passing that chain of props through extra wrapper components.
 *
 * URL sync stays out of the reducer so the reducer can be unit-tested as a
 * plain function. Shareable link format: /?product=helmet
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createInitialState, getActiveProduct, productReducer } from './productReducer.js';

const ProductContext = createContext(null);

export function ProductProvider({ children, products }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProductId = searchParams.get('product');

  const [state, dispatch] = useReducer(
    productReducer,
    { products, urlProductId },
    createInitialState
  );

  // URL -> state only when the query param itself changes (back/forward, pasted link).
  // Do not depend on activeProductId here — that would send the *old* URL back
  // into the reducer after the user clicks a different product.
  useEffect(() => {
    const exists = products.some((product) => product.id === urlProductId);
    if (exists) {
      dispatch({ type: 'SELECT_PRODUCT', id: urlProductId });
    }
  }, [urlProductId, products]);

  // state -> URL (so the current product can be shared / bookmarked)
  useEffect(() => {
    if (searchParams.get('product') !== state.activeProductId) {
      setSearchParams({ product: state.activeProductId }, { replace: true });
    }
  }, [searchParams, setSearchParams, state.activeProductId]);

  const selectProduct = useCallback((id) => {
    dispatch({ type: 'SELECT_PRODUCT', id });
  }, []);

  const updateDraft = useCallback((patch) => {
    dispatch({ type: 'UPDATE_DRAFT', patch });
  }, []);

  const resetDraft = useCallback(() => {
    dispatch({ type: 'RESET_DRAFT' });
  }, []);

  const setLoading = useCallback((isModelLoading) => {
    dispatch({ type: 'SET_LOADING', isModelLoading });
  }, []);

  const value = useMemo(
    () => ({
      products: state.products,
      activeProduct: getActiveProduct(state),
      activeProductId: state.activeProductId,
      draft: state.draft,
      isModelLoading: state.isModelLoading,
      selectProduct,
      updateDraft,
      resetDraft,
      setLoading,
    }),
    [state, selectProduct, updateDraft, resetDraft, setLoading]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) {
    throw new Error('useProduct must be used inside ProductProvider');
  }
  return value;
}
