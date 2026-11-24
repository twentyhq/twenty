import { useContext } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPickerContext } from './EmojiPickerContext';

export const useEmojiPickerContextOrThrow = () => {
  const context = useContext(EmojiPickerContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate('EmojiPicker parts must be inside EmojiPicker.Root'),
    );
  }

  return context;
};
