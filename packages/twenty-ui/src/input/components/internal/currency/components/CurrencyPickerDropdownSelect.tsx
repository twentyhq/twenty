import { useMemo, useState } from 'react';

import { DropdownMenu } from 'src/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from 'src/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from 'src/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from 'src/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from 'src/navigation/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from 'src/navigation/menu-item/components/MenuItemSelectAvatar';

import { CurrencyOption } from './CurrencyPickerDropdownButton';

export const CurrencyPickerDropdownSelect = ({
  currencies,
  selectedCurrency,
  onChange,
}: {
  currencies: CurrencyOption[];
  selectedCurrency?: CurrencyOption;
  onChange: (currency: CurrencyOption) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredCurrencies = useMemo(
    () =>
      currencies.filter(
        ({ value, label }) =>
          value
            .toLocaleLowerCase()
            .includes(searchFilter.toLocaleLowerCase()) ||
          label.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase()),
      ),
    [currencies, searchFilter],
  );

  return (
    <DropdownMenu width="200px" disableBlur>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredCurrencies.length === 0 ? (
          <MenuItem text="No result" />
        ) : (
          <>
            {selectedCurrency && (
              <MenuItemSelectAvatar
                key={selectedCurrency.value}
                selected={true}
                onClick={() => onChange(selectedCurrency)}
                text={`${selectedCurrency.label} (${selectedCurrency.value})`}
              />
            )}
            {filteredCurrencies.map((item) =>
              selectedCurrency?.value === item.value ? null : (
                <MenuItemSelectAvatar
                  key={item.value}
                  selected={selectedCurrency?.value === item.value}
                  onClick={() => onChange(item)}
                  text={`${item.label} (${item.value})`}
                />
              ),
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
