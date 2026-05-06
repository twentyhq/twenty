import { WebGlMount } from '@/lib/visual-runtime';
import { Product } from '@/sections/Hero/visuals/Product';

export function ProductVisual() {
  return (
    <WebGlMount priority>
      <Product />
    </WebGlMount>
  );
}
