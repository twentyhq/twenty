import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { type EmojiPickerProps } from '../types/EmojiPickerProps';
import { EmojiPickerOptions } from './EmojiPickerOptions';
import { EmojiPickerRoot } from './EmojiPickerRoot';

export const EmojiPickerShorthand = ({
  emojibaseUrl,
  locale,
  onEmojiSelect,
  searchLabel,
  searchPlaceholder,
  loadingLabel,
  emptyLabel,
  autoFocus,
  open,
  defaultOpen,
  onOpenChange,
  triggerProps,
  contentProps,
}: EmojiPickerProps) => (
  <Dropdown.Root
    type="picker"
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    <EmojiPickerRoot
      emojibaseUrl={emojibaseUrl}
      locale={locale}
      onEmojiSelect={onEmojiSelect}
    >
      <Dropdown.Trigger
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...triggerProps}
      />
      <Dropdown.Content
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...contentProps}
      >
        <EmojiPickerOptions
          searchLabel={searchLabel}
          searchPlaceholder={searchPlaceholder}
          loadingLabel={loadingLabel}
          emptyLabel={emptyLabel}
          autoFocus={autoFocus}
        />
      </Dropdown.Content>
    </EmojiPickerRoot>
  </Dropdown.Root>
);
