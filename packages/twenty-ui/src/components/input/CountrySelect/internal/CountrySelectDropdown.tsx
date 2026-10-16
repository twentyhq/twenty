import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { type CountrySelectProps } from '../types/CountrySelectProps';
import { CountrySelectAvailabilityEffect } from './CountrySelectAvailabilityEffect';
import { CountrySelectTrigger } from './CountrySelectTrigger';
import { CountrySelectOptions } from './CountrySelectOptions';
import { useCountrySelectContext } from './useCountrySelectContext';

type CountrySelectDropdownProps = Omit<
  CountrySelectProps,
  | 'countries'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'disabled'
  | 'noCountryLabel'
>;

export const CountrySelectDropdown = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onEscapeKeyDown,
  onInteractOutside,
  defaultPage,
  popupProps,
  optionsProps,
  searchLabel,
  noResultsLabel,
  searchProps,
  closeOnSelect,
  ...triggerProps
}: CountrySelectDropdownProps) => {
  const { disabled } = useCountrySelectContext();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const requestedOpen = controlledOpen ?? uncontrolledOpen;
  const open = !disabled && requestedOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && disabled) {
      return;
    }

    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const popupLabel = [triggerProps['aria-label'], triggerProps.label].find(
    isNonEmptyString,
  );

  return (
    <>
      <CountrySelectAvailabilityEffect
        disabled={disabled}
        open={requestedOpen}
        onOpenChange={handleOpenChange}
      />
      <Dropdown.Root
        type="picker"
        open={open}
        onOpenChange={handleOpenChange}
        onEscapeKeyDown={onEscapeKeyDown}
        onInteractOutside={onInteractOutside}
        defaultPage={defaultPage}
      >
        <CountrySelectTrigger
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...triggerProps}
        />
        <Dropdown.Content
          aria-label={popupLabel}
          aria-labelledby={triggerProps['aria-labelledby']}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...popupProps}
        >
          <CountrySelectOptions
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...optionsProps}
            searchLabel={searchLabel}
            noResultsLabel={noResultsLabel}
            searchProps={searchProps}
            closeOnSelect={closeOnSelect}
          />
        </Dropdown.Content>
      </Dropdown.Root>
    </>
  );
};
