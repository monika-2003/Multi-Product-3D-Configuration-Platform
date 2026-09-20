/**
 * Product list is built from the catalog array.
 * Adding a product in products.js automatically adds a button here.
 */
export default function ProductSwitcher({ products, activeProductId, onSelect }) {
  return (
    <div className="switcher">
      <p className="panel-label">Products</p>
      <div className="switcher-list">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            className={product.id === activeProductId ? 'is-active' : ''}
            onClick={() => onSelect(product.id)}
          >
            {product.name}
          </button>
        ))}
      </div>
    </div>
  );
}
