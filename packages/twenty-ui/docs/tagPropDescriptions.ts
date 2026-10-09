import { type TagProps } from '../src/primitives/data-display/Tag/types/TagProps';

export const TAG_PROP_DESCRIPTIONS = {
  color: 'Theme color for the tag, or `transparent` for an unfilled label.',
  weight: 'Font weight of the label.',
  variant: 'Visual treatment of the tag background and border.',
  startIcon:
    'Decorative icon before the label. Hidden from assistive technology.',
  truncate:
    'Truncates constrained string labels and exposes the full text in a tooltip. Set to `false` to show the full label without a tooltip.',
  borderStyle: 'Border style used by the outline variant.',
  render:
    'Replaces the default span. Compose a button or link to provide explicit interaction semantics.',
  onClick:
    'Native click handler. Does not change the default span or add keyboard activation.',
} satisfies Partial<Record<keyof TagProps, string>>;
