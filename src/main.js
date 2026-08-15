// Import master stylesheet
import './styles/main.css';

// Import core application orchestrator and custom cursor
import { Cursor } from './core/Cursor';
import { App } from './core/App';

// Launch custom cursor immediately
try {
  window.CURSOR_INSTANCE = new Cursor();
} catch (e) {
  console.warn('Cursor boot warning:', e);
}

// Launch the application once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.APP_INSTANCE = app;
});

