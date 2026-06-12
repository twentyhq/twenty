import { useAsyncResource } from './use-async-resource';

export function useAsyncImage(
  loader: (() => Promise<HTMLImageElement>) | null,
  deps: readonly unknown[],
) {
  return useAsyncResource(loader, deps);
}
