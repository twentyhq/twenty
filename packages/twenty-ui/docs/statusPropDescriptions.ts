import { type StatusProps } from '../src/primitives/data-display/Status/types/StatusProps';

export const STATUS_PROP_DESCRIPTIONS = {
  color: 'Theme color used for the status background, text, and loader.',
  weight: 'Font weight of the label.',
  loading:
    'Shows a decorative loader after the label and defaults aria-busy to true. The caller owns announcements and disabled interaction.',
  onClick:
    'Native click handler. Does not change the default span or add keyboard activation.',
  render:
    'Replaces the default span. Compose a button or link to provide explicit interaction semantics.',
} satisfies Partial<Record<keyof StatusProps, string>>;
