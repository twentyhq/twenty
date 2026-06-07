'use client';

import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { chipBaseStyles } from './chip-styles';

const Row = styled.dl`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    // Align the label to the first chip's baseline rather than the row's
    // center: when chips wrap to multiple lines in a narrow card, centering
    // floats the label to the middle and visually lifts the first chip into
    // the row above. Baseline keeps the label pinned beside the first chip.
    align-items: baseline;
    flex-direction: row;
    gap: ${theme.spacing(4)};
  }
`;

const RowLabel = styled.dt`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  margin: 0;
  text-transform: uppercase;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-shrink: 0;
    width: 80px;
  }
`;

const ChipListWrapper = styled.dd`
  margin: 0;
`;

const ChipList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

type PartnerChipRowProps<TValue extends string> = {
  label: MessageDescriptor;
  values: readonly TValue[];
  valueLabels: Record<TValue, MessageDescriptor>;
};

// Falls back when the CRM stores a value the website doesn't yet know about
// (e.g. a new language). Turns "TAMIL" → "Tamil", "SELF_HOST" → "Self host".
const titleCaseFallback = (raw: string): string =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function PartnerChipRow<TValue extends string>({
  label,
  values,
  valueLabels,
}: PartnerChipRowProps<TValue>) {
  const { i18n } = useLingui();

  return (
    <Row>
      <RowLabel>{i18n._(label)}</RowLabel>
      <ChipListWrapper>
        <ChipList>
          {values.map((value) => {
            const descriptor = valueLabels[value];
            const text = descriptor
              ? i18n._(descriptor)
              : titleCaseFallback(value);
            return (
              <li key={value} className={chipBaseStyles}>
                {text}
              </li>
            );
          })}
        </ChipList>
      </ChipListWrapper>
    </Row>
  );
}
