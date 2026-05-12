import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in the document.');
}

createRoot(rootElement).render(<App />);
