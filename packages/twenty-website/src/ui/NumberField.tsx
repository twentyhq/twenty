'use client';

import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

const Wrapper = styled.div`
  align-items: center;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  box-sizing: border-box;
  display: flex;
  height: clamp(40px, 5.5vh, 56px);
  padding: 0 ${spacing(3)};
  width: 100%;

  &:focus-within {
    border-color: ${color('blue')};
  }

  &[data-invalid] {
    border-color: ${color('error')};
  }
`;

const Prefix = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  margin-right: ${spacing(2)};
`;

const Control = styled.input`
  background: none;
  border: none;
  color: ${semanticColor.ink};
  flex: 1 1 auto;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  height: 100%;
  min-width: 0;

  &::placeholder {
    color: ${semanticColor.inkSubtle};
  }

  &:focus {
    outline: none;
  }
`;

// A numeric amount field with an optional prefix adornment (a currency symbol).
// It strips anything but digits and a decimal point on input, keeping the value
// clean for a consumer's parseFloat.
export function NumberField({
  ariaLabel,
  invalid = false,
  name,
  onValueChange,
  placeholder,
  prefix,
  value,
}: {
  ariaLabel: string;
  invalid?: boolean;
  name: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  value: string;
}) {
  return (
    <Wrapper data-invalid={invalid ? '' : undefined}>
      {prefix !== undefined ? <Prefix aria-hidden>{prefix}</Prefix> : null}
      <Control
        aria-label={ariaLabel}
        autoComplete="off"
        inputMode="decimal"
        name={name}
        onChange={(event) =>
          onValueChange(event.target.value.replace(/[^\d.]/g, ''))
        }
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </Wrapper>
  );
}
