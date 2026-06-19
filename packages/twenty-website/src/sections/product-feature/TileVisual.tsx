'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';

import { observeElementVisibility } from '@/platform/visuals/engine/observe-element-visibility';

import { ContactsVisual } from './ContactsVisual';
import { DashboardVisual } from './DashboardVisual';
import { EmailsVisual } from './EmailsVisual';
import { type FeatureVisualKey } from './feature-tiles';
import { FilesVisual } from './FilesVisual';
import { ImportVisual } from './ImportVisual';
import { PipelineVisual } from './PipelineVisual';
import { TasksVisual } from './TasksVisual';

const VISUALS: Record<FeatureVisualKey, ComponentType<{ active: boolean }>> = {
  contacts: ContactsVisual,
  dashboard: DashboardVisual,
  emails: EmailsVisual,
  files: FilesVisual,
  import: ImportVisual,
  pipeline: PipelineVisual,
  tasks: TasksVisual,
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
      <Visual active={active} />
    </div>
  );
}
