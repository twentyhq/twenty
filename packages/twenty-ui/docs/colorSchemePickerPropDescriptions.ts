import { type ComponentProps } from 'react';

import { type ColorSchemePicker } from '../src/components/input/ColorSchemePicker/ColorSchemePicker';

export const COLOR_SCHEME_PICKER_PROP_DESCRIPTIONS = {
  value:
    'Selected scheme: Light, Dark, or System. The application resolves system to a concrete theme.',
  className: 'Class applied to the outer container.',
  onChange: 'Called with the newly selected color scheme.',
  lightLabel: 'Visible label and accessible name of the light choice.',
  darkLabel: 'Visible label and accessible name of the dark choice.',
  systemLabel: 'Visible label and accessible name of the system choice.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof ColorSchemePicker>, string>
>;
