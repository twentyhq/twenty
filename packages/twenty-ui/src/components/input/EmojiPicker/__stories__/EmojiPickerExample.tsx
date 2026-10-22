import { useState } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPicker } from '../EmojiPicker';
import { type EmojiPickerProps } from '../types/EmojiPickerProps';
import { EMOJI_PICKER_STORY_EMOJIBASE_URL } from './emojiPickerStoryEmojibaseUrl';

const EMOJI_PICKER_STORY_WIDTH_PX = 296;

type EmojiPickerExampleProps = Partial<
  Pick<
    EmojiPickerProps,
    | 'emojibaseUrl'
    | 'searchLabel'
    | 'searchPlaceholder'
    | 'loadingLabel'
    | 'emptyLabel'
    | 'autoFocus'
    | 'onEmojiSelect'
  >
>;

export const EmojiPickerExample = ({
  emojibaseUrl = EMOJI_PICKER_STORY_EMOJIBASE_URL,
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
        width: EMOJI_PICKER_STORY_WIDTH_PX,
      }}
    >
      <EmojiPicker
        emojibaseUrl={emojibaseUrl}
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
