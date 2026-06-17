import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

// Set up nostr-tools to use the CORS proxy for LNURL endpoint calls.
// This prevents cross-origin errors when resolving LNURL-pay endpoints.
import { nip57 } from 'nostr-tools';
import { proxiedFetch } from '@/lib/utils';
nip57.useFetchImplementation(proxiedFetch);

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// FIXME: a custom font should be used. Eg:
// import '@fontsource-variable/<font-name>';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
