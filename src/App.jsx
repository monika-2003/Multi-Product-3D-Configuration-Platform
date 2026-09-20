/**
 * App layout: 3D viewer on the left, catalog switcher + live editor on the right.
 *
 * ProductViewer is lazy-loaded so the heavy three.js code is not in the first JS bundle.
 * It is also memoized, so overlay / panel re-renders do not rebuild the canvas.
 */
import { lazy, Suspense } from 'react';
import ConfigEditor from './components/ConfigEditor.jsx';
import ProductSwitcher from './components/ProductSwitcher.jsx';
import { useProduct } from './state/ProductProvider.jsx';
import './App.css';

const ProductViewer = lazy(() => import('./components/ProductViewer.jsx'));

function App() {
  const {
    products,
    activeProduct,
    activeProductId,
    draft,
    isModelLoading,
    selectProduct,
    updateDraft,
    resetDraft,
    setLoading,
  } = useProduct();

  return (
    <div className="layout">
      <section className="stage">
        {isModelLoading && (
          <div className="loading-overlay" role="status">
            Loading model…
          </div>
        )}
        <p className="stage-label">{activeProduct.name}</p>
        <Suspense fallback={<div className="loading-overlay">Loading viewer…</div>}>
          <ProductViewer
            modelUrl={activeProduct.modelUrl}
            color={draft.color}
            scale={draft.scale}
            camera={draft.camera}
            onLoadingChange={setLoading}
          />
        </Suspense>
      </section>

      <aside className="panel">
        <header className="panel-header">
          <h1>3D Product Config</h1>
          <p>Switch products, then live-edit color, scale, and camera.</p>
        </header>

        <ProductSwitcher
          products={products}
          activeProductId={activeProductId}
          onSelect={selectProduct}
        />

        <ConfigEditor
          draft={draft}
          featureFlags={activeProduct.featureFlags}
          onChange={updateDraft}
          onReset={resetDraft}
        />
      </aside>
    </div>
  );
}

export default App;
