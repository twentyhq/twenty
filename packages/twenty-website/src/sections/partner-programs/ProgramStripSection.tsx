import { type ComponentProps } from 'react';

import { SectionShell } from '@/ui';

import { ProgramStrip } from './ProgramStrip';

// The strip as a section of its own, for a call that belongs to no block above.
export function ProgramStripSection(
  props: ComponentProps<typeof ProgramStrip>,
) {
  return (
    <SectionShell rhythm="section" scheme="muted">
      <ProgramStrip headingLevel="h2" {...props} />
    </SectionShell>
  );
}
