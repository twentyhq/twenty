import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { type CurrencyPickerProps } from '../types/CurrencyPickerProps';
import { CurrencyPickerOptions } from './CurrencyPickerOptions';
import { CurrencyPickerRoot } from './CurrencyPickerRoot';
import { CurrencyPickerTrigger } from './CurrencyPickerTrigger';

export const CurrencyPickerShorthand = ({
  currencies,
  value,
  defaultValue,
  onValueChange,
  closeOnSelect,
  disabled,
  selectedFirst,
  getOptionLabel,
  getSearchText,
  renderValue,
  open,
  defaultOpen,
  onOpenChange,
  onEscapeKeyDown,
  onInteractOutside,
  triggerProps,
  contentProps,
  optionsProps,
  ...props
}: CurrencyPickerProps) => (
  <Dropdown.Root
    type="picker"
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    onEscapeKeyDown={onEscapeKeyDown}
    onInteractOutside={onInteractOutside}
  >
    <CurrencyPickerRoot
      currencies={currencies}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      closeOnSelect={closeOnSelect}
      disabled={disabled}
      selectedFirst={selectedFirst}
      getOptionLabel={getOptionLabel}
      getSearchText={getSearchText}
      renderValue={renderValue}
    >
      <CurrencyPickerTrigger
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...props}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...triggerProps}
      />
      <Dropdown.Content
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...contentProps}
      >
        <CurrencyPickerOptions
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...optionsProps}
        />
      </Dropdown.Content>
    </CurrencyPickerRoot>
  </Dropdown.Root>
);
