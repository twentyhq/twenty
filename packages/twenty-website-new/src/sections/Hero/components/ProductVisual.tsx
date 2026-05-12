import { WebGlMount } from '@/lib/visual-runtime';
import { Product } from '@/sections/Hero/visuals/components/Product';
import { ProductPlaceholder } from '@/sections/Hero/visuals/components/ProductPlaceholder';

export function ProductVisual() {
  return (
    <WebGlMount priority fallback={<ProductPlaceholder />}>
      <Product />
    </WebGlMount>
  );
}
