import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from 'src/field/hooks/useRegisterInputEvents';
import { StyledTextInput } from 'src/field/input/components/FieldTextInput';
import { CurrencyOption, CurrencyPickerDropdownButton } from 'src/input';
import { isDefined } from 'src/utils';

const StyledCurrencyInput = styled(StyledTextInput)`
  padding: ${({ theme }) => `${theme.spacing(0)} ${theme.spacing(1)}`};
`;

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;
  justify-content: center;
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;

  & > svg {
    padding-left: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.font.color.tertiary};
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

export type CurrencyInputProps = {
  autoFocus?: boolean;
  currencyOptions: CurrencyOption[];
  currencyCode: string;
  hotkeyScope: string;
  onChange?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onSelect?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onTab?: (newText: string) => void;
  placeholder?: string;
  value: string;
};

export const CurrencyInput = ({
  autoFocus,
  currencyOptions,
  currencyCode,
  hotkeyScope,
  onChange,
  onClickOutside,
  onEnter,
  onEscape,
  onSelect,
  onShiftTab,
  onTab,
  placeholder,
  value,
}: CurrencyInputProps) => {
  const theme = useTheme();

  const [internalText, setInternalText] = useState(value);
  const [internalCurrency, setInternalCurrency] =
    useState<CurrencyOption | null>(null);

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };

  const handleCurrencyChange = (currency: CurrencyOption) => {
    setInternalCurrency(currency);
    onSelect?.(currency.value);
  };

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  useEffect(() => {
    const currency = currencyOptions.find(
      ({ value }) => value === currencyCode,
    );
    if (isDefined(currency)) {
      setInternalCurrency(currency);
    }
  }, [currencyOptions, currencyCode]);

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const Icon = internalCurrency?.Icon;

  return (
    <StyledContainer ref={wrapperRef}>
      <CurrencyPickerDropdownButton
        valueCode={internalCurrency?.value ?? ''}
        onChange={handleCurrencyChange}
        currencies={currencyOptions}
      />
      <StyledIcon>
        {Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
      </StyledIcon>
      <StyledCurrencyInput
        autoComplete="off"
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        value={value}
      />
    </StyledContainer>
  );
};
