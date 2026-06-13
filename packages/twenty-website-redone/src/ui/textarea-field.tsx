'use client';

import { styled } from '@linaria/react';

import { fieldControlClassName } from './field-control-style';

const Textarea = styled.textarea`
  min-height: 96px;
  resize: vertical;
`;

// A multi-line text control sharing the typed-control look.
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
