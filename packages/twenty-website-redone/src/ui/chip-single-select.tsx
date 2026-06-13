'use client';

import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

import { chipClassName } from './chip-style';

export type ChipChoice<TValue extends string> = {
  label: string;
  value: TValue;
};

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

// A radiogroup of chips for a small set of mutually exclusive options
// (typeOfTeam) — the old site used a dropdown, but two options read better as
// visible chips than a hidden menu.
export function ChipSingleSelect<TValue extends string>({
  ariaLabel,
  onSelect,
  options,
  value,
}: {
  ariaLabel: string;
  onSelect: (value: TValue) => void;
  options: readonly ChipChoice<TValue>[];
  value: TValue | '';
}) {
  return (
    <ChipRow aria-label={ariaLabel} role="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            aria-checked={selected}
            className={chipClassName}
            data-selected={selected ? '' : undefined}
            key={option.value}
            onClick={() => onSelect(option.value)}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </ChipRow>
  );
}
