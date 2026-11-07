import * as React from 'react';
import FunkyFox from './FunkyFox';
import { initSupabaseRealtime } from './admin/services/supabaseRealtime';
import { Analytics } from '@vercel/analytics/react';

function App() {
  React.useEffect(() => {
    // Establish real-time WebSocket database synchronization for storefront and admin
    const cleanup = initSupabaseRealtime();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <>
      <FunkyFox />
      <Analytics />
    </>
  );
}

export default App;
