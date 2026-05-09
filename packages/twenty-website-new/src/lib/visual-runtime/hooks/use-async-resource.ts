'use client';

import { useEffect, useState } from 'react';

type AsyncResourceOptions<T> = {
  dispose?: (resource: T) => void;
};

export function useAsyncResource<T>(
  loader: (() => Promise<T>) | null,
  deps: readonly unknown[],
  options?: AsyncResourceOptions<T>,
) {
  const [resource, setResource] = useState<T | null>(null);

  useEffect(() => {
    if (!loader) {
      setResource(null);
      return;
    }

    let cancelled = false;
    let loadedResource: T | null = null;

    setResource(null);

    void Promise.resolve()
      .then(() => loader())
      .then(
        (result) => {
          if (cancelled) {
            options?.dispose?.(result);
            return;
          }

          loadedResource = result;
          setResource(result);
        },
        (error) => {
          if (!cancelled) {
            console.error(error);
          }
        },
      );

    return () => {
      cancelled = true;
      if (loadedResource) {
        options?.dispose?.(loadedResource);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return resource;
}
