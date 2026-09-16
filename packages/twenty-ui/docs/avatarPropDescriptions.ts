import { type AvatarProps } from '../src/primitives/data-display/Avatar/types/AvatarProps';

export const AVATAR_PROP_DESCRIPTIONS = {
  src: 'Image URL. A missing or failed image shows the fallback.',
  name: 'Name used for the first-letter fallback and the default accessible name when clickable.',
  colorSeed: 'Stable value used to choose fallback colors. Defaults to `name`.',
  size: 'Avatar size: `xs` (12px), `sm` (14px), `md` (16px), `lg` (24px), or `xl` (40px).',
  shape: 'Shape of the avatar and its fallback.',
  variant: 'Visual treatment of the fallback.',
  icon: 'Icon rendered instead of the image and first-letter fallback.',
  color: 'Text color override for a first-letter fallback.',
  backgroundColor: 'Background color override for a first-letter fallback.',
  borderColor: 'Border color override for the outline fallback.',
  pulsing: 'Animates the avatar opacity. Respects reduced-motion preferences.',
  disabled:
    'Applies disabled styling and disables activation when `onClick` is supplied.',
  nativeButton:
    'Set to `false` when a clickable avatar uses `render` with an element other than a native button.',
} satisfies Partial<Record<keyof AvatarProps, string>>;
