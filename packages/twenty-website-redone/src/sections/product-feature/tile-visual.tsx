'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';

import { observeElementVisibility } from '@/platform/visuals/engine/observe-element-visibility';

import { type FeatureVisualKey } from './feature-tiles';
import { FilesVisual } from './files-visual';
import { ImportVisual } from './import-visual';

// Visuals land with their commits; unbuilt keys render the bare frame.
const VISUALS: Partial<
  Record<FeatureVisualKey, ComponentType<{ active: boolean }>>
> = {
  files: FilesVisual,
  import: ImportVisual,
};

// A visual is "active" while 30% of it is on screen — each visual
// decides what its active state animates.
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
      {Visual ? <Visual active={active} /> : null}
    </div>
  );
}
