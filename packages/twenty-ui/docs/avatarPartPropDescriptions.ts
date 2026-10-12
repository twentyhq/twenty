import { type AvatarFallbackProps } from '../src/primitives/data-display/Avatar/types/AvatarFallbackProps';
import { type AvatarImageProps } from '../src/primitives/data-display/Avatar/types/AvatarImageProps';
import { type AvatarRootProps } from '../src/primitives/data-display/Avatar/types/AvatarRootProps';

import { AVATAR_PROP_DESCRIPTIONS } from './avatarPropDescriptions';

export const AVATAR_PART_PROP_DESCRIPTIONS = {
  Root: {
    name: 'Name used to choose fallback colors. Does not add children or accessible labels.',
    colorSeed: AVATAR_PROP_DESCRIPTIONS.colorSeed,
    size: AVATAR_PROP_DESCRIPTIONS.size,
    shape: AVATAR_PROP_DESCRIPTIONS.shape,
    variant: AVATAR_PROP_DESCRIPTIONS.variant,
    color: AVATAR_PROP_DESCRIPTIONS.color,
    backgroundColor: AVATAR_PROP_DESCRIPTIONS.backgroundColor,
    borderColor: AVATAR_PROP_DESCRIPTIONS.borderColor,
    pulsing: AVATAR_PROP_DESCRIPTIONS.pulsing,
    ring: AVATAR_PROP_DESCRIPTIONS.ring,
    children: 'Caller-owned Image, Fallback, and other content.',
    render: AVATAR_PROP_DESCRIPTIONS.render,
  } satisfies Partial<Record<keyof AvatarRootProps, string>>,
  Image: {
    src: 'Image URL. Image renders after a successful load unless keepMounted is enabled.',
    alt: 'Caller-owned alternative text. Use an empty string for decorative images.',
    srcSet: 'Native responsive image source candidates.',
    sizes: 'Native responsive image sizes used with srcSet.',
    crossOrigin:
      'Native image cross-origin policy, also used during preloading.',
    referrerPolicy:
      'Native image referrer policy, also used during preloading.',
    loading: 'Native eager or lazy loading. Use keepMounted for lazy loading.',
    onLoadingStatusChange:
      'Called when Base UI reports a loading, loaded, or error status. Shares that state with Root and Fallback.',
    keepMounted:
      'Keeps the image mounted and loads it in place. Loading and failed images stay hidden while Fallback is shown.',
    render:
      'Replaces the image. Preserve a native image and forward the supplied attributes, events, and ref.',
  } satisfies Partial<Record<keyof AvatarImageProps, string>>,
  Fallback: {
    children: 'Caller-owned fallback content, such as initials or an icon.',
    delay: 'Milliseconds before the initial fallback is shown. Defaults to 0.',
    render:
      'Replaces the fallback span. Forward the supplied props and ref, and provide its accessible label or decorative attributes.',
  } satisfies Partial<Record<keyof AvatarFallbackProps, string>>,
};
