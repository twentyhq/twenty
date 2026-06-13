'use client';

import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

import { chipClassName } from './chip-style';

export type ChipOption<TValue extends string> = {
  label: string;
  value: TValue;
};

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

export function ChipMultiSelect<TValue extends string>({
  ariaLabel,
  onToggle,
  options,
  values,
}: {
  ariaLabel: string;
  onToggle: (value: TValue) => void;
  options: readonly ChipOption<TValue>[];
  values: readonly TValue[];
}) {
  return (
    <ChipRow aria-label={ariaLabel} role="group">
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <button
            aria-pressed={selected}
            className={chipClassName}
            data-selected={selected ? '' : undefined}
            key={option.value}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </ChipRow>
  );
}
