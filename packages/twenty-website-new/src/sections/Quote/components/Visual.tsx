'use client';

import { WebGlMount } from '@/lib/visual-runtime';
import { Quotes } from '@/sections/Quote/visuals/Quotes';

export function Visual() {
  return (
    <WebGlMount>
      <Quotes />
    </WebGlMount>
  );
}
