import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ hinzufügen
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>        {/* ✅ BrowserRouter hier einfügen */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
