import './styles/main.css';

import { Cursor } from './core/Cursor';
import { App } from './core/App';

try {
  window.CURSOR_INSTANCE = new Cursor();
} catch (e) {
  console.warn('Cursor boot warning:', e);
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.APP_INSTANCE = app;
});
