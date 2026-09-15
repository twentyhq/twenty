'use client';

import { fieldControlClassName } from './field-control-style';

// A single-line text control. Self-labels via ariaLabel (some steps show no
// visible label, only a placeholder), and flags invalid input so the shared
// control style paints the red border.
export function TextField({
  ariaLabel,
  inputMode,
  invalid = false,
  name,
  onValueChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  inputMode?: 'email' | 'url' | 'text';
  invalid?: boolean;
  name: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <input
      aria-invalid={invalid ? true : undefined}
      aria-label={ariaLabel}
      autoComplete="off"
      className={fieldControlClassName}
      inputMode={inputMode}
      name={name}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  );
}
