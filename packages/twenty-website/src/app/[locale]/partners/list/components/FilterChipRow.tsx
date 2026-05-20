'use client';

import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { theme } from '@/theme';

import { chipBaseStyles } from './chip-styles';

type FilterChipRowProps<T extends string> = {
  label: MessageDescriptor;
  values: readonly T[];
  valueLabels: Record<T, MessageDescriptor>;
  selected: ReadonlySet<T>;
  onToggle: (value: T) => void;
};

const Section = styled.section`
  align-items: baseline;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: row;
    gap: ${theme.spacing(4)};
  }
`;

const RowLabel = styled.h3`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  margin: 0;
  min-width: 80px;
  text-transform: uppercase;
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
`;

const Chip = styled.button`
  cursor: pointer;

  &[aria-pressed='true'] {
    background-color: ${theme.colors.primary.text[100]};
    border-color: ${theme.colors.primary.text[100]};
    color: ${theme.colors.primary.background[100]};
  }

  &:hover:not([aria-pressed='true']) {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.border[40]};
    outline-offset: 2px;
  }
`;

export function FilterChipRow<T extends string>({
  label,
  values,
  valueLabels,
  selected,
  onToggle,
}: FilterChipRowProps<T>) {
  const { i18n } = useLingui();

  return (
    <Section>
      <RowLabel>{i18n._(label)}</RowLabel>
      <ChipList role="group" aria-label={i18n._(label)}>
        {values.map((value) => {
          const isPressed = selected.has(value);
          return (
            <Chip
              key={value}
              type="button"
              aria-pressed={isPressed}
              className={chipBaseStyles}
              onClick={() => onToggle(value)}
            >
              {i18n._(valueLabels[value])}
            </Chip>
          );
        })}
      </ChipList>
    </Section>
  );
}
