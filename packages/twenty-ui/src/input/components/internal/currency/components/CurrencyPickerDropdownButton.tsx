import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronDown } from 'src/display';
import { SelectOption } from 'src/input/components/Select';
import { Dropdown } from 'src/layout/dropdown/components/Dropdown';
import { useDropdown } from 'src/layout/dropdown/hooks/useDropdown';
import { CurrencyCode } from 'src/types/CurrencyCode';
import { isDefined } from 'src/utils/isDefined';

import { CurrencyPickerHotkeyScope } from '../types/CurrencyPickerHotkeyScope';

import { CurrencyPickerDropdownSelect } from './CurrencyPickerDropdownSelect';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
};

const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;
  display: flex;
  border-right: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  height: 32px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;
  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
  }
`;

export type CurrencyOption = SelectOption<string>;

export const CurrencyPickerDropdownButton = ({
  valueCode,
  onChange,
  currencies,
}: {
  valueCode: string;
  onChange: (currency: CurrencyOption) => void;
  currencies: CurrencyOption[];
}) => {
  const theme = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>();

  const { isDropdownOpen, closeDropdown } = useDropdown(
    CurrencyPickerHotkeyScope.CurrencyPicker,
  );

  const handleChange = (currency: CurrencyOption) => {
    onChange(currency);
    closeDropdown();
  };

  useEffect(() => {
    const currency = currencies.find(({ value }) => value === valueCode);
    if (isDefined(currency)) {
      setSelectedCurrency(currency);
    }
  }, [valueCode, currencies]);

  return (
    <Dropdown
      dropdownMenuWidth={200}
      dropdownId="currncy-picker-dropdown-id"
      dropdownHotkeyScope={{ scope: CurrencyPickerHotkeyScope.CurrencyPicker }}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isDropdownOpen}>
          <StyledIconContainer>
            {selectedCurrency ? selectedCurrency.value : CurrencyCode.USD}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledIconContainer>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <CurrencyPickerDropdownSelect
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onChange={handleChange}
        />
      }
      dropdownPlacement="bottom-start"
      dropdownOffset={{ x: 0, y: 4 }}
    />
  );
};
