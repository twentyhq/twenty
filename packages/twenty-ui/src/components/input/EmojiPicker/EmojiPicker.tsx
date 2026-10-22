import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { clsx } from 'clsx';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';
import { useRef, useState } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import styles from './EmojiPicker.module.scss';
import { EmojiPickerEmoji } from './internal/EmojiPickerEmoji';
import { EmojiPickerRow } from './internal/EmojiPickerRow';
import { EmojiPickerScrollEffect } from './internal/EmojiPickerScrollEffect';
import { type EmojiPickerProps } from './types/EmojiPickerProps';

const EMOJI_PICKER_COLUMNS = 8;
const EMOJI_PICKER_ARROW_KEY_PREFIX = doNotTranslate('Arrow');

export const EmojiPicker = ({
  emojibaseUrl,
  locale = 'en',
  searchLabel,
  searchPlaceholder = searchLabel,
  loadingLabel,
  emptyLabel,
  onEmojiSelect,
  autoFocus = false,
  className,
  onKeyDownCapture,
  onPointerOverCapture,
  ref,
  ...props
}: EmojiPickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const isKeyboardNavigationRef = useRef(false);
  const [keyboardNavigationRequest, setKeyboardNavigationRequest] = useState(0);

  return (
    <FrimousseEmojiPicker.Root
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);

        if (
          event.defaultPrevented ||
          !event.key.startsWith(EMOJI_PICKER_ARROW_KEY_PREFIX)
        ) {
          return;
        }

        isKeyboardNavigationRef.current = true;
        setKeyboardNavigationRequest((request) => request + 1);
      }}
      onPointerOverCapture={(event) => {
        isKeyboardNavigationRef.current = false;
        onPointerOverCapture?.(event);
      }}
      ref={mergedRef}
      className={clsx(styles.root, className)}
      emojibaseUrl={emojibaseUrl}
      locale={locale}
      columns={EMOJI_PICKER_COLUMNS}
      onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}
    >
      <div className={styles.search}>
        <Input
          render={<FrimousseEmojiPicker.Search />}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          autoFocus={autoFocus}
        />
      </div>
      <FrimousseEmojiPicker.Viewport className={styles.viewport} tabIndex={0}>
        <FrimousseEmojiPicker.Loading className={styles.message}>
          {loadingLabel}
        </FrimousseEmojiPicker.Loading>
        <FrimousseEmojiPicker.Empty className={styles.message}>
          {emptyLabel}
        </FrimousseEmojiPicker.Empty>
        <FrimousseEmojiPicker.List
          components={{ Row: EmojiPickerRow, Emoji: EmojiPickerEmoji }}
        />
      </FrimousseEmojiPicker.Viewport>
      <EmojiPickerScrollEffect
        rootRef={rootRef}
        isKeyboardNavigationRef={isKeyboardNavigationRef}
        keyboardNavigationRequest={keyboardNavigationRequest}
      />
    </FrimousseEmojiPicker.Root>
  );
};
