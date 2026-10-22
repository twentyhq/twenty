import { useActiveEmoji } from 'frimousse';
import { type RefObject, useLayoutEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { scrollActiveEmojiIntoView } from './scrollActiveEmojiIntoView';

type EmojiPickerScrollEffectProps = {
  rootRef: RefObject<HTMLDivElement | null>;
  isKeyboardNavigationRef: RefObject<boolean>;
  keyboardNavigationRequest: number;
};

export const EmojiPickerScrollEffect = ({
  rootRef,
  isKeyboardNavigationRef,
  keyboardNavigationRequest,
}: EmojiPickerScrollEffectProps) => {
  const activeEmoji = useActiveEmoji();

  useLayoutEffect(() => {
    if (!isKeyboardNavigationRef.current || !isDefined(rootRef.current)) {
      return;
    }

    scrollActiveEmojiIntoView(rootRef.current);
  }, [
    activeEmoji,
    isKeyboardNavigationRef,
    keyboardNavigationRequest,
    rootRef,
  ]);

  return null;
};
