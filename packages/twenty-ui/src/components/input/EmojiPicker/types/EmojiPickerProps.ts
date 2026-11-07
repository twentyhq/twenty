import { type ComponentPropsWithRef } from 'react';

export type EmojiPickerProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> & {
  emojibaseUrl: string;
  locale?: string;
  searchLabel: string;
  searchPlaceholder?: string;
  loadingLabel: string;
  emptyLabel: string;
  onEmojiSelect: (emoji: string) => void;
  autoFocus?: boolean;
};
