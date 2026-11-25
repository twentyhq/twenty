import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { clsx } from 'clsx';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';
import { useRef } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';
import { Separator } from '@ui/primitives/layout/Separator/Separator';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import styles from './EmojiPicker.module.scss';
import { EmojiPickerEmoji } from './internal/EmojiPickerEmoji';
import { EmojiPickerRow } from './internal/EmojiPickerRow';
import { EmojiPickerScrollEffect } from './internal/EmojiPickerScrollEffect';
import { type EmojiPickerProps } from './types/EmojiPickerProps';

const EMOJI_PICKER_COLUMNS = 8;
const EMOJI_PICKER_KEYS = doNotTranslate([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
]);

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
  onKeyDown,
  ref,
  ...props
}: EmojiPickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);

  return (
    <FrimousseEmojiPicker.Root
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={mergedRef}
      className={clsx(styles.root, className)}
      emojibaseUrl={emojibaseUrl}
      locale={locale}
      columns={EMOJI_PICKER_COLUMNS}
      onEmojiSelect={({ emoji }) => onEmojiSelect(emoji)}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || !EMOJI_PICKER_KEYS.includes(event.key)) {
          return;
        }

        const forwardedEvent = new KeyboardEvent('keydown', {
          key: event.key,
          code: event.code,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          repeat: event.repeat,
          cancelable: true,
        });

        event.currentTarget.ownerDocument.dispatchEvent(forwardedEvent);

        if (forwardedEvent.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div className={styles.search}>
        <Input
          render={<FrimousseEmojiPicker.Search />}
          aria-label={searchLabel}
          placeholder={searchPlaceholder}
          autoFocus={autoFocus}
          variant="plain"
          hasFocusRing={false}
          className={styles.searchInput}
        />
      </div>
      <Separator className={styles.separator} />
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
      <EmojiPickerScrollEffect rootRef={rootRef} />
    </FrimousseEmojiPicker.Root>
  );
};
