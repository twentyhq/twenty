import { type ComponentProps } from 'react';

import { type AvatarGroup } from '../src/components/data-display/AvatarGroup/AvatarGroup';

export const AVATAR_GROUP_PROP_DESCRIPTIONS = {
  avatars:
    'Avatar elements in display order. Empty React nodes are ignored. Supply stable keys to preserve identity when reordering.',
  className: 'Class applied to the group container.',
  maxVisible:
    'Maximum number of actual avatars to show, excluding the overflow indicator. Floored and clamped to zero; Infinity shows all avatars and NaN shows none.',
  total:
    'Total collection size for partially loaded avatars. Floored and never smaller than the supplied renderable count; nonfinite values use the supplied count.',
  renderOverflow:
    'Called with the derived hidden count when it is positive. Return a custom indicator, or null to hide it.',
  render:
    'Element or render function for the root. Forward the supplied props and ref; the default element is a div.',
  ref: 'Ref to the rendered root element.',
  overflowShape: 'Shape of the numeric overflow indicator.',
  overlap:
    'Physical margin, left or right, that carries the negative overlap offset. Later avatars always render above earlier ones.',
  overlapOffset: 'CSS length of the overlap between avatars.',
} satisfies Partial<Record<keyof ComponentProps<typeof AvatarGroup>, string>>;
