'use client';

import { useEffect, useRef, useState } from 'react';

import { observeElementVisibility } from '@/platform/visuals/engine/observe-element-visibility';

import { VISUALS } from '../data/visuals';
import { type FeatureVisualKey } from '../types/feature-visual-key';

const ACTIVE_THRESHOLD = 0.3;

export function TileVisual({ visualKey }: { visualKey: FeatureVisualKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    return observeElementVisibility(element, setActive, {
      threshold: ACTIVE_THRESHOLD,
    });
  }, []);

  const Visual = VISUALS[visualKey];

  return (
    <div ref={ref} style={{ height: '100%', width: '100%' }}>
      <Visual active={active} />
    </div>
  );
}
