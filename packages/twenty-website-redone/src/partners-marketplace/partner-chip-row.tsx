'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  fontFamily,
  FONT_WEIGHT,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { partnerChipClassName } from './partner-chip-style';
import { titleCaseFallback } from './title-case-fallback';

const Row = styled.dl`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  margin: 0;

  ${mediaUp('md')} {
    // Align the label to the first chip's baseline rather than the row's
    // center: when chips wrap to multiple lines in a narrow card, centering
    // floats the label to the middle and visually lifts the first chip into
    // the row above. Baseline keeps the label pinned beside the first chip.
    align-items: baseline;
    flex-direction: row;
    gap: ${spacing(4)};
  }
`;

const RowLabel = styled.dt`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
  margin: 0;
  text-transform: uppercase;

  ${mediaUp('md')} {
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
  gap: ${spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

type PartnerChipRowProps<TValue extends string> = {
  label: MessageDescriptor;
  values: readonly TValue[];
  valueLabels: Record<TValue, MessageDescriptor>;
};

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
              <li key={value} className={partnerChipClassName}>
                {text}
              </li>
            );
          })}
        </ChipList>
      </ChipListWrapper>
    </Row>
  );
}
