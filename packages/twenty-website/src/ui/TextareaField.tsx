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
    <Textarea
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
