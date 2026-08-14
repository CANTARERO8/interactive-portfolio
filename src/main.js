// Import master stylesheet
import './styles/main.css';

// Import core application orchestrator
import { App } from './core/App';

// Launch the application once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Attach app instance globally for diagnostic access if needed
  window.APP_INSTANCE = app;
});
