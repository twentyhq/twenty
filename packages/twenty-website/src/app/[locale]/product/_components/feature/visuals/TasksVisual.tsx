'use client';

import { RecordPage } from './RecordPage';

type TasksVisualProps = {
  active: boolean;
};

export function TasksVisual({ active: _active }: TasksVisualProps) {
  return (
    <RecordPage
      defaultTab="Tasks"
      switchable={['Timeline', 'Tasks', 'Notes']}
    />
  );
}
