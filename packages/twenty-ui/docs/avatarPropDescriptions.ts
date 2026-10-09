import { type AvatarProps } from '../src/primitives/data-display/Avatar/types/AvatarProps';

export const AVATAR_PROP_DESCRIPTIONS = {
  src: 'Image URL. A missing or failed image shows the fallback. `imageProps.src` overrides this value.',
  name: 'Name used for the first-letter fallback and fallback colors. Does not add an accessible label.',
  colorSeed: 'Stable value used to choose fallback colors. Defaults to `name`.',
  size: 'Avatar size: `xs` (12px), `sm` (14px), `md` (16px), `lg` (24px), or `xl` (40px).',
  shape: 'Shape of the avatar and its fallback.',
  variant: 'Visual treatment of the fallback.',
  icon: 'Decorative icon rendered instead of the image and first-letter fallback. Give the root an accessible label when the icon conveys information.',
  color: 'Text color override for a first-letter fallback.',
  backgroundColor: 'Background color override for a first-letter fallback.',
  borderColor: 'Border color override for the outline fallback.',
  pulsing: 'Animates the avatar opacity. Respects reduced-motion preferences.',
  ring: 'Surrounds the avatar with a background-colored ring so overlapping avatars stay distinct.',
  imageProps:
    'Complete `Avatar.Image` props, including native image attributes, refs, `render`, `keepMounted`, and `onLoadingStatusChange`. Alternative text defaults to an empty string. Supply a nonempty `alt` to label the image and default fallback.',
  fallbackProps:
    'Complete `Avatar.Fallback` props, including caller-owned children, labeling, refs, `render`, and fallback `delay` in milliseconds.',
  render:
    'Caller-supplied root element or renderer. Defaults to a presentational span. Compose a native button or link explicitly for interaction, and put its click handler and disabled state on that owner.',
} satisfies Partial<Record<keyof AvatarProps, string>>;
