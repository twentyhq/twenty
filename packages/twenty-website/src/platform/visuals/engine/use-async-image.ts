'use client';

import { useAsyncResource } from './use-async-resource';

export function useAsyncImage(
  loader: (() => Promise<HTMLImageElement>) | null,
): HTMLImageElement | null {
  return useAsyncResource(loader);
}
