import { useState } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPicker } from '../EmojiPicker';
import { type EmojiPickerProps } from '../types/EmojiPickerProps';
import { EMOJI_PICKER_STORY_EMOJIBASE_URL } from './emojiPickerStoryEmojibaseUrl';

type EmojiPickerExampleProps = Partial<
  Pick<
    EmojiPickerProps,
    | 'searchLabel'
    | 'searchPlaceholder'
    | 'loadingLabel'
    | 'emptyLabel'
    | 'autoFocus'
    | 'onEmojiSelect'
  >
>;

export const EmojiPickerExample = ({
  searchLabel = 'Search emojis',
  searchPlaceholder,
  loadingLabel = 'Loading emojis',
  emptyLabel = 'No emoji found',
  autoFocus = false,
  onEmojiSelect,
}: EmojiPickerExampleProps) => {
  const [emoji, setEmoji] = useState<string | undefined>();

  return (
    <Text
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: themeCssVariables.spacing[2],
        width: 296,
      }}
    >
      <EmojiPicker
        emojibaseUrl={EMOJI_PICKER_STORY_EMOJIBASE_URL}
        searchLabel={searchLabel}
        searchPlaceholder={searchPlaceholder}
        loadingLabel={loadingLabel}
        emptyLabel={emptyLabel}
        autoFocus={autoFocus}
        onEmojiSelect={(selectedEmoji) => {
          setEmoji(selectedEmoji);
          onEmojiSelect?.(selectedEmoji);
        }}
      />
      <Text role="status">
        {isDefined(emoji) ? `Selected emoji: ${emoji}` : 'Choose an emoji'}
      </Text>
    </Text>
  );
};
