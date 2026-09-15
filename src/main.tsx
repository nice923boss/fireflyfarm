import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { loadBundledContent } from './content';
import { Site } from './site/Site';

const content = loadBundledContent();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site content={content} />
  </StrictMode>,
);
