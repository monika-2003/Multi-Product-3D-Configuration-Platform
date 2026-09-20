import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { PRODUCTS } from './catalog/products.js';
import { ProductProvider } from './state/ProductProvider.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProductProvider products={PRODUCTS}>
        <App />
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>
);
