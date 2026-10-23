import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { clsx } from 'clsx';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';
import { useRef } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';

import styles from './EmojiPicker.module.scss';
import { EmojiPickerEmoji } from './internal/EmojiPickerEmoji';
import { EmojiPickerRow } from './internal/EmojiPickerRow';
import { EmojiPickerScrollEffect } from './internal/EmojiPickerScrollEffect';
import { type EmojiPickerProps } from './types/EmojiPickerProps';

const EMOJI_PICKER_COLUMNS = 8;

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
      <EmojiPickerScrollEffect rootRef={rootRef} />
    </FrimousseEmojiPicker.Root>
  );
};
