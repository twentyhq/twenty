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
  /** The control's accessible name, needed even beside a visible label: some steps show only a placeholder. */
  ariaLabel: string;
  /** The keyboard a phone shows: `email`, `url` or `text`. The input stays a text input. */
  inputMode?: 'email' | 'url' | 'text';
  /** Sets `aria-invalid` and paints the shared red border. The error text lives elsewhere (the wizard's footer banner). */
  invalid?: boolean;
  /** The input's `name`, for the form it sits in. */
  name: string;
  /** Called with the new text on every change. The field is controlled: pass it back as `value`. */
  onValueChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string;
  /** The current text. */
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
