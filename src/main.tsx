import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

// Give nostr-tools a timed fetch for LNURL resolution so it can't hang.
import { nip57 } from 'nostr-tools';
nip57.useFetchImplementation((url: string) =>
  fetch(url, { signal: AbortSignal.timeout(15000) }),
);

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Optional font import:
// import '@fontsource-variable/<font-name>';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
