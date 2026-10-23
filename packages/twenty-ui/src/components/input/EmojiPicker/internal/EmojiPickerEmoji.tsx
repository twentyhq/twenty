import { type EmojiPickerListEmojiProps } from 'frimousse';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const EmojiPickerEmoji = ({
  emoji,
  'aria-colindex': columnIndex,
  ...props
}: EmojiPickerListEmojiProps) => (
  <button
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    type="button"
    role="gridcell"
    aria-colindex={isDefined(columnIndex) ? columnIndex + 1 : undefined}
  >
    {emoji.emoji}
  </button>
);
