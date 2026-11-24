import { type ReactNode } from 'react';

export type EmojiPickerRootProps = {
  emojibaseUrl: string;
  locale?: string;
  onEmojiSelect: (emoji: string) => void;
  children?: ReactNode;
};
