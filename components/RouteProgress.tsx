'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Lightweight top progress bar shown briefly on every route change.
 * No external deps; CSS animation does the heavy lifting.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const [renderKey, setRenderKey] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setRenderKey(k => k + 1);
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      key={renderKey}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[10002] h-0.5 pointer-events-none"
    >
      <div className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)] route-progress-bar" />
    </div>
  );
}
