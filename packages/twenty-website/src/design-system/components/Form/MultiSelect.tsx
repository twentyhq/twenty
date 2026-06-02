'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

export type FormMultiSelectOption<TValue extends string> = {
  value: TValue;
  label: ReactNode;
};

const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
`;

const PillButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(8)};
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3)};

  &[data-selected='true'] {
    background: ${theme.colors.primary.background[100]};
    border-color: ${theme.colors.primary.background[100]};
    color: ${theme.colors.primary.text[100]};
  }

  &[data-invalid='true'] {
    border-color: #ff9a9a;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

type FormMultiSelectProps<TValue extends string> = {
  values: ReadonlyArray<TValue>;
  onToggle: (value: TValue) => void;
  options: ReadonlyArray<FormMultiSelectOption<TValue>>;
  invalid?: boolean;
  ariaLabel?: string;
};

export function FormMultiSelect<TValue extends string>({
  values,
  onToggle,
  options,
  invalid,
  ariaLabel,
}: FormMultiSelectProps<TValue>) {
  return (
    <PillGroup role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <PillButton
            key={option.value}
            type="button"
            aria-pressed={selected}
            data-selected={selected ? 'true' : undefined}
            data-invalid={invalid && !selected ? 'true' : undefined}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </PillButton>
        );
      })}
    </PillGroup>
  );
}
