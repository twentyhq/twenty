import { type ComponentProps } from 'react';

import { type ColorSchemePicker } from '../src/components/input/ColorSchemePicker/ColorSchemePicker';

export const COLOR_SCHEME_PICKER_PROP_DESCRIPTIONS = {
  value:
    'Selected scheme: Light, Dark, or System. The application resolves system to a concrete theme.',
  className: 'Class applied to the outer container.',
  onChange: 'Called with the newly selected color scheme.',
  lightLabel:
    'Visible caption for the light scheme. The control’s accessible name remains Light.',
  darkLabel:
    'Visible caption for the dark scheme. The control’s accessible name remains Dark.',
  systemLabel:
    'Visible caption for the system scheme. The control’s accessible name remains System.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ColorSchemePicker>, string>
>;
