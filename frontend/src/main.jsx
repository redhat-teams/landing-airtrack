import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource-variable/bricolage-grotesque/opsz.css';
import '@fontsource-variable/instrument-sans';

import App from './App';
import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/widgets.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
