'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { FaqBackground } from '@/sections/Faq/visuals/Background';

export function FaqBackgroundMount() {
  return (
    <WebGlMount>
      <FaqBackground />
    </WebGlMount>
  );
}
