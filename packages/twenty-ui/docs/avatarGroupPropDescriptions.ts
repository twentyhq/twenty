import { type ComponentProps } from 'react';

import { type AvatarGroup } from '../src/components/data-display/AvatarGroup/AvatarGroup';

export const AVATAR_GROUP_PROP_DESCRIPTIONS = {
  avatars:
    'Avatar elements in display order. Only the first maxVisible elements are shown.',
  className: 'Class applied to the group container.',
  maxVisible: 'Maximum number of supplied avatars to show.',
  overflowAvatar:
    'Custom trailing element, used instead of the numeric overflow indicator.',
  overflowCount:
    'Number shown in the trailing +N indicator. Compute this in the application; it is not derived from avatars.',
  overflowShape: 'Shape of the numeric overflow indicator.',
  overlap: 'Which side of adjacent avatars overlaps.',
  overlapOffset: 'CSS length of the overlap between avatars.',
} satisfies Partial<Record<keyof ComponentProps<typeof AvatarGroup>, string>>;
