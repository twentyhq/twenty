import { clsx } from 'clsx';
import { EmojiPicker as FrimousseEmojiPicker } from 'frimousse';

import { Input } from '@ui/primitives/input/Input/Input';

import styles from './EmojiPicker.module.scss';
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
  ...props
}: EmojiPickerProps) => (
  <FrimousseEmojiPicker.Root
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
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
    <FrimousseEmojiPicker.Viewport className={styles.viewport}>
      <FrimousseEmojiPicker.Loading className={styles.message}>
        {loadingLabel}
      </FrimousseEmojiPicker.Loading>
      <FrimousseEmojiPicker.Empty className={styles.message}>
        {emptyLabel}
      </FrimousseEmojiPicker.Empty>
      <FrimousseEmojiPicker.List />
    </FrimousseEmojiPicker.Viewport>
  </FrimousseEmojiPicker.Root>
);
