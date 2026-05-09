import { WebGlMount } from '@/lib/visual-runtime';
import { Product, ProductPlaceholder } from '@/sections/Hero/visuals/Product';

export function ProductVisual() {
  return (
    <WebGlMount priority fallback={<ProductPlaceholder />}>
      <Product />
    </WebGlMount>
  );
}
