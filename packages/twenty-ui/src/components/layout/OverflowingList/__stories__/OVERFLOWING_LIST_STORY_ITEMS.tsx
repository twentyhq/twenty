import { Tag } from '@ui/primitives/data-display/Tag/Tag';

export const OVERFLOWING_LIST_STORY_ITEMS = [
  'Customer',
  'Partner',
  'Priority',
  'Renewal',
].map((label) => (
  <Tag key={label} color="blue" preventShrink style={{ width: 80 }}>
    {label}
  </Tag>
));
