'use client';

import { RecordPage } from './RecordPage';

type EmailsVisualProps = {
  active: boolean;
};

export function EmailsVisual({ active: _active }: EmailsVisualProps) {
  return <RecordPage defaultTab="Emails" switchable={['Emails']} />;
}
