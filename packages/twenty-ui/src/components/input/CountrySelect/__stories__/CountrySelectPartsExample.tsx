import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Button } from '@ui/primitives/input/Button/Button';

import { CountrySelect } from '../CountrySelect';
import { type CountrySelectProps } from '../types/CountrySelectProps';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';

type CountrySelectPartsExampleProps = Pick<
  CountrySelectProps,
  'onValueChange' | 'onOpenChange'
> & {
  compound?: boolean;
  controlled?: boolean;
  cancelSelection?: boolean;
  closeOnSelect?: boolean;
  keepMounted?: boolean;
  openOnHover?: boolean;
};

export const CountrySelectPartsExample = ({
  compound = false,
  controlled = false,
  cancelSelection = false,
  closeOnSelect,
  keepMounted,
  openOnHover,
  onValueChange,
  onOpenChange,
}: CountrySelectPartsExampleProps) => {
  const [value, setValue] = useState<string | null>('FR');
  const [disabled, setDisabled] = useState(false);
  const handleValueChange: NonNullable<CountrySelectProps['onValueChange']> = (
    nextValue,
    eventDetails,
  ) => {
    onValueChange?.(nextValue, eventDetails);

    if (cancelSelection) {
      eventDetails.cancel();
      return;
    }

    setValue(nextValue);
  };
  const countries = [
    ...COUNTRY_CHOICES,
    { value: 'CA', label: 'Canada', disabled: true },
    { value: '', label: 'An empty identifier' },
    { value: 'no-country', label: 'A reserved-looking identifier' },
  ];
  const rootProps = {
    countries,
    value: controlled ? value : undefined,
    defaultValue: 'FR',
    disabled,
    onValueChange: handleValueChange,
  };

  return (
    <>
      {compound ? (
        <CountrySelect.Root
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...rootProps}
        >
          <Dropdown.Root type="picker" onOpenChange={onOpenChange}>
            <CountrySelect.Trigger
              label="Country"
              openOnHover={openOnHover}
              delay={0}
            />
            <Dropdown.Content keepMounted={keepMounted}>
              <CountrySelect.Options
                searchLabel="Search countries"
                closeOnSelect={closeOnSelect}
              />
              <Button onClick={() => setDisabled(true)}>
                Disable country picker
              </Button>
            </Dropdown.Content>
          </Dropdown.Root>
        </CountrySelect.Root>
      ) : (
        <CountrySelect
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...rootProps}
          label="Country"
          searchLabel="Search countries"
          closeOnSelect={closeOnSelect}
          popupProps={{ keepMounted }}
        />
      )}
      <Button onClick={() => setValue('JP')}>Apply Japan</Button>
      <Button onClick={() => setValue(null)}>Clear externally</Button>
      <Button onClick={() => setDisabled(!disabled)}>Toggle disabled</Button>
      <span role="status" aria-label="Selected identifier">
        {value ?? 'null'}
      </span>
    </>
  );
};
