'use client';

import { fieldControlClassName } from './field-control-style';

// A numeric amount field. It strips anything but digits and a decimal point on
// input (so a typed "5,000" stores as "5000"), keeping the value clean for the
// request body's parseFloat. Currency-symbol-free — the label names the amount.
export function CurrencyField({
  ariaLabel,
  name,
  onValueChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  name: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <input
      aria-label={ariaLabel}
      autoComplete="off"
      className={fieldControlClassName}
      inputMode="decimal"
      name={name}
      onChange={(event) =>
        onValueChange(event.target.value.replace(/[^\d.]/g, ''))
      }
      placeholder={placeholder}
      type="text"
      value={value}
    />
  );
}
