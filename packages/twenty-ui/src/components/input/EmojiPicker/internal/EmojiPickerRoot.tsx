import { type EmojiPickerRootProps } from '../types/EmojiPickerRootProps';
import { EmojiPickerContext } from './EmojiPickerContext';

export const EmojiPickerRoot = ({
  emojibaseUrl,
  locale = 'en',
  onEmojiSelect,
  children,
}: EmojiPickerRootProps) => (
  <EmojiPickerContext.Provider value={{ emojibaseUrl, locale, onEmojiSelect }}>
    {children}
  </EmojiPickerContext.Provider>
);
