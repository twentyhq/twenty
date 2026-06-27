import { type Scheme } from '@/tokens';

export function findActiveSurfaceScheme(
  surfaces: readonly { top: number; bottom: number; scheme: Scheme | null }[],
  line: number,
): Scheme | null {
  const active = surfaces.find(
    (surface) => surface.top <= line && surface.bottom > line,
  );
  return active?.scheme ?? null;
}
