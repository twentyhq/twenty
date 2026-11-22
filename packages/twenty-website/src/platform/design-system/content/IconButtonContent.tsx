'use client';

import { PlusMark } from '@/icons';
import { IconButton } from '@/ui';

import { type ComponentContent } from '../component-content';

export const ICON_BUTTON_CONTENT: ComponentContent = {
  name: 'IconButton',
  summary:
    'A square bordered button holding only an icon, with a required accessible label and a light hover wash.',
  renderWith: (axisProps) => (
    <IconButton ariaLabel="Add" {...axisProps}>
      <PlusMark />
    </IconButton>
  ),
  baseCode: { ariaLabel: '"Add"' },
  codeChildren: '<PlusMark />',
  practices: [
    {
      id: 'disabled',
      text: (
        <>
          The disabled glyph uses the scheme&apos;s strong line tone so it stays
          legible on dark panels (IconButton.tsx:18-26)
        </>
      ),
    },
  ],
};
