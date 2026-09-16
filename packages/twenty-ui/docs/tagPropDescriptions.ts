import { type TagProps } from '../src/primitives/data-display/Tag/types/TagProps';

export const TAG_PROP_DESCRIPTIONS = {
  color: 'Theme color for the tag, or `transparent` for an unfilled label.',
  weight: 'Font weight of the label.',
  disabled:
    'Applies disabled styling and prevents pointer and keyboard activation.',
  nativeButton:
    'Set to `false` when a clickable tag uses `render` with an element other than a native button.',
  variant: 'Visual treatment of the tag background and border.',
  startIcon:
    'Decorative icon before the label. Hidden from assistive technology.',
  preventShrink:
    'Keeps the tag from shrinking and disables string-label truncation and its tooltip.',
  preventPadding: 'Removes the tag padding.',
  borderStyle: 'Border style used by the outline variant.',
} satisfies Partial<Record<keyof TagProps, string>>;
