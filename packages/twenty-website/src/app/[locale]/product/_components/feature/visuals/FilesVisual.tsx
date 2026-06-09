'use client';

import { RecordPage } from './RecordPage';

type FilesVisualProps = {
  active: boolean;
};

export function FilesVisual({ active: _active }: FilesVisualProps) {
  return <RecordPage defaultTab="Files" switchable={['Files']} />;
}
