import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { AdminApp } from './admin/AdminApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
