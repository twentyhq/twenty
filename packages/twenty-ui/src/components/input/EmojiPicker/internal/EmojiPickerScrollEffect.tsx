import { type RefObject, useEffect } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { scrollActiveEmojiIntoView } from './scrollActiveEmojiIntoView';

const EMOJI_PICKER_ARROW_KEY_PREFIX = doNotTranslate('Arrow');
const EMOJI_PICKER_KEY_DOWN_EVENT = doNotTranslate('keydown');
const EMOJI_PICKER_POINTER_OVER_EVENT = doNotTranslate('pointerover');

type EmojiPickerScrollEffectProps = {
  rootRef: RefObject<HTMLDivElement | null>;
};

export const EmojiPickerScrollEffect = ({
  rootRef,
}: EmojiPickerScrollEffectProps) => {
  useEffect(() => {
    const rootElement = rootRef.current;

    if (!isDefined(rootElement)) {
      return;
    }

    let animationFrame: number | undefined;

    const cancelScroll = () => {
      if (!isDefined(animationFrame)) {
        return;
      }

      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !event.key.startsWith(EMOJI_PICKER_ARROW_KEY_PREFIX)
      ) {
        return;
      }

      cancelScroll();
      animationFrame = requestAnimationFrame(() => {
        animationFrame = requestAnimationFrame(() => {
          animationFrame = undefined;
          scrollActiveEmojiIntoView(rootElement);
        });
      });
    };

    rootElement.addEventListener(
      EMOJI_PICKER_KEY_DOWN_EVENT,
      handleKeyDown,
      true,
    );
    rootElement.addEventListener(
      EMOJI_PICKER_POINTER_OVER_EVENT,
      cancelScroll,
      true,
    );

    return () => {
      cancelScroll();
      rootElement.removeEventListener(
        EMOJI_PICKER_KEY_DOWN_EVENT,
        handleKeyDown,
        true,
      );
      rootElement.removeEventListener(
        EMOJI_PICKER_POINTER_OVER_EVENT,
        cancelScroll,
        true,
      );
    };
  }, [rootRef]);

  return null;
};
