'use client';

import { styled } from '@linaria/react';

import { fieldControlClassName } from './field-control-style';

// A multi-line text control sharing the typed-control look, but growing from a
// min-height rather than the fixed single-line control height.
const Textarea = styled.textarea`
  height: auto;
  min-height: clamp(80px, 18vh, 185px);
  resize: vertical;
`;

export function TextareaField({
  ariaLabel,
  invalid = false,
  name,
  onValueChange,
  placeholder,
  value,
}: {
  /** The control's accessible name, needed even beside a visible label. */
  ariaLabel: string;
  /** Sets `aria-invalid` and paints the shared red border. */
  invalid?: boolean;
  /** The textarea's `name`, for the form it sits in. */
  name: string;
  /** Called with the new text on every change. The field is controlled: pass it back as `value`. */
  onValueChange: (value: string) => void;
  /** Shown while the field is empty. */
  placeholder?: string;
  /** The current text. */
  value: string;
}) {
  return (
    <Textarea
      aria-invalid={invalid ? true : undefined}
      aria-label={ariaLabel}
      autoComplete="off"
      className={fieldControlClassName}
      name={name}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}
