import { type EmojiPickerListRowProps } from 'frimousse';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const EmojiPickerRow = ({
  'aria-rowindex': rowIndex,
  ...props
}: EmojiPickerListRowProps) => (
  <div
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    aria-rowindex={isDefined(rowIndex) ? rowIndex + 1 : undefined}
  />
);
