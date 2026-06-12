'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ChangeEvent } from 'react';

const Wrapper = styled.div`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  height: clamp(40px, 5.5vh, 56px);
  padding: 0 ${theme.spacing(3)};
  width: 100%;

  &[data-invalid='true'] {
    border-color: #ff9a9a;
  }

  &:focus-within {
    border-color: ${theme.colors.highlight[100]};
  }
`;

const Prefix = styled.span`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  margin-right: ${theme.spacing(2)};
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: ${theme.colors.secondary.text[100]};
  flex: 1 1 auto;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  height: 100%;
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }
`;

type FormCurrencyProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  name?: string;
  ariaLabel?: string;
};

// Allow either decimal separator: mobile `inputMode="decimal"` keyboards emit
// ',' in many locales (EU, SA). The value is normalized to '.' on change.
const ALLOWED_CHARS = /^[0-9]*[.,]?[0-9]*$/;

export function FormCurrency({
  value,
  onValueChange,
  placeholder,
  invalid,
  name,
  ariaLabel,
}: FormCurrencyProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (next === '' || ALLOWED_CHARS.test(next)) {
      onValueChange(next.replace(',', '.'));
    }
  };

  return (
    <Wrapper data-invalid={invalid ? 'true' : undefined}>
      <Prefix aria-hidden>$</Prefix>
      <Input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={handleChange}
      />
    </Wrapper>
  );
}
