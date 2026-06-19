'use client';

import { useEffect, useState } from 'react';

type AsyncResourceOptions<TResource> = {
  dispose?: (resource: TResource) => void;
};

// Load-on-mount with race-safe cancellation: a resource that resolves after
// unmount (or after the loader changed) is disposed, never delivered. The
// loader's IDENTITY is the dependency — pass a stable function (useCallback
// or a module-level closure) or null to idle.
export function useAsyncResource<TResource>(
  loader: (() => Promise<TResource>) | null,
  options?: AsyncResourceOptions<TResource>,
): TResource | null {
  const [resource, setResource] = useState<TResource | null>(null);
  const dispose = options?.dispose;

  useEffect(() => {
    if (loader === null) {
      setResource(null);
      return;
    }

    let cancelled = false;
    let loadedResource: TResource | null = null;

    setResource(null);

    void Promise.resolve()
      .then(() => loader())
      .then(
        (result) => {
          if (cancelled) {
            dispose?.(result);
            return;
          }
          loadedResource = result;
          setResource(result);
        },
        (error: unknown) => {
          if (!cancelled && process.env.NODE_ENV !== 'production') {
            console.error(error);
          }
        },
      );

    return () => {
      cancelled = true;
      if (loadedResource !== null) {
        dispose?.(loadedResource);
      }
    };
  }, [loader, dispose]);

  return resource;
}
