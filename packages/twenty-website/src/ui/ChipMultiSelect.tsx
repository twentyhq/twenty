'use client';

import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

export type ChipOption<TValue extends string> = {
  label: string;
  value: TValue;
};

const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

// Selected = the scheme inverted (ink fill / surface text): on the dark form a
// white pill with black text, the old site's selected state expressed as a rule.
const Pill = styled.button`
  background: none;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(8)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.regular};
  line-height: 1.2;
  padding: ${spacing(1.5)} ${spacing(3)};

  &[data-selected] {
    background: ${semanticColor.ink};
    border-color: ${semanticColor.ink};
    color: ${semanticColor.surface};
  }

  &:focus-visible {
    outline: 2px solid ${color('blue')};
    outline-offset: 2px;
  }
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
    <PillGroup aria-label={ariaLabel} role="group">
      {options.map((option) => {
        const selected = values.includes(option.value);
        return (
          <Pill
            aria-pressed={selected}
            data-selected={selected ? '' : undefined}
            key={option.value}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            {option.label}
          </Pill>
        );
      })}
    </PillGroup>
  );
}
