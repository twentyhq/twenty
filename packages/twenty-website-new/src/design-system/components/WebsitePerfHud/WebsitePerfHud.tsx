'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// Enable with ?perf=1 in the URL, or NEXT_PUBLIC_WEBSITE_PERF_HUD=1 for local dev.
function isPerfHudEnabled() {
  if (typeof window === 'undefined') {
    return false;
  }
  if (process.env.NEXT_PUBLIC_WEBSITE_PERF_HUD === '1') {
    return true;
  }
  return new URLSearchParams(window.location.search).get('perf') === '1';
}

type PerfSnapshot = {
  canvasCount: number;
  fps: number;
  jsHeapUsedMb: number | null;
  longTasksSinceOpen: number;
  recordedAt: string;
};

export function WebsitePerfHud() {
  const [enabled, setEnabled] = useState(false);
  const [fps, setFps] = useState(0);
  const [canvasCount, setCanvasCount] = useState(0);
  const [jsHeapUsedMb, setJsHeapUsedMb] = useState<number | null>(null);
  const [longTasksSinceOpen, setLongTasksSinceOpen] = useState(0);

  useEffect(() => {
    setEnabled(isPerfHudEnabled());
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let rafId = 0;
    let last = performance.now();
    let frames = 0;

    const tick = (now: number) => {
      frames += 1;
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
        setCanvasCount(document.querySelectorAll('canvas').length);
        const memory = (
          performance as Performance & {
            memory?: { usedJSHeapSize: number };
          }
        ).memory;
        setJsHeapUsedMb(
          memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null,
        );
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof PerformanceObserver === 'undefined') {
      return;
    }

    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        setLongTasksSinceOpen((count) => count + list.getEntries().length);
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch {
      // Long Task API unsupported in this browser
    }

    return () => observer?.disconnect();
  }, [enabled]);

  const snapshot = useMemo(
    (): PerfSnapshot => ({
      canvasCount,
      fps,
      jsHeapUsedMb,
      longTasksSinceOpen,
      recordedAt: new Date().toISOString(),
    }),
    [canvasCount, fps, jsHeapUsedMb, longTasksSinceOpen],
  );

  const copyReport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    } catch {
      // Clipboard may be denied
    }
  }, [snapshot]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      style={{
        background: 'rgba(0,0,0,0.82)',
        borderRadius: 8,
        bottom: 12,
        color: '#e8e8e8',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        left: 12,
        lineHeight: 1.45,
        maxWidth: 280,
        padding: '10px 12px',
        position: 'fixed',
        zIndex: 99999,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Perf (local)</div>
      <div>FPS: {fps}</div>
      <div>
        &lt;canvas&gt; count: {canvasCount}
        <div style={{ color: '#999', fontSize: 10, marginTop: 4 }}>
          In this app each R3F Canvas is its own WebGL context (not one shared
          renderer).
        </div>
      </div>
      <div>
        JS heap (Chrome):{' '}
        {jsHeapUsedMb === null ? 'n/a' : `${jsHeapUsedMb} MB`}
      </div>
      <div>Long tasks (session): {longTasksSinceOpen}</div>
      <button
        onClick={copyReport}
        style={{
          background: '#333',
          border: '1px solid #555',
          borderRadius: 4,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 10,
          marginTop: 8,
          padding: '4px 8px',
        }}
        type="button"
      >
        Copy JSON snapshot
      </button>
      <div style={{ color: '#777', fontSize: 9, marginTop: 8 }}>
        Toggle: ?perf=1 or NEXT_PUBLIC_WEBSITE_PERF_HUD=1
      </div>
    </div>
  );
}
