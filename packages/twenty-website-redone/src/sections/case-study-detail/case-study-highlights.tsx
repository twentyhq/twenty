import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { type CaseStudyKpi } from '@/case-studies';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { SectionShell } from '@/ui';

const Frame = styled.div`
  margin-inline: auto;
  max-width: 556px;
  width: 100%;
`;

const Grid = styled.div`
  border-bottom: 1px solid ${color('black-20')};
  border-top: 1px solid ${color('black-20')};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;

  &[data-count='1'] {
    grid-template-columns: minmax(0, 1fr);
  }

  &[data-count='3'] > *:nth-child(n + 3),
  &[data-count='4'] > *:nth-child(n + 3) {
    border-top: 1px solid ${color('black-10')};
  }

  ${mediaUp('md')} {
    &[data-count='3'] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &[data-count='4'] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    &[data-count='3'] > *:nth-child(n + 3),
    &[data-count='4'] > *:nth-child(n + 3) {
      border-top: none;
    }
  }
`;

const Cell = styled.div`
  align-items: flex-start;
  border-left: 1px solid ${color('black-10')};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  justify-content: center;
  min-width: 0;
  padding: ${spacing(5)} ${spacing(4)};

  &:nth-child(odd) {
    border-left: none;
  }

  ${mediaUp('md')} {
    padding: ${spacing(6)} ${spacing(4)};

    &:nth-child(odd) {
      border-left: 1px solid ${color('black-10')};
    }

    &:first-child {
      border-left: none;
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }
`;

const Value = styled.span`
  ${typeRampDeclarations('headingXs')}
  color: ${color('black')};
  font-family: ${fontFamily('serif')};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.015em;
  min-width: 0;
  overflow-wrap: break-word;
  width: 100%;
`;

const Label = styled.span`
  color: ${color('black-40')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export type CaseStudyHighlightsProps = {
  industry: MessageDescriptor;
  kpis: readonly CaseStudyKpi[];
};

export function CaseStudyHighlights({
  industry,
  kpis,
}: CaseStudyHighlightsProps) {
  const i18n = getServerI18n();
  const cells: readonly CaseStudyKpi[] = [
    { value: industry, label: msg`Industry` },
    ...kpis,
  ];

  return (
    <SectionShell scheme="light">
      <Frame>
        <Grid data-count={cells.length}>
          {cells.map((cell) => (
            <Cell key={getMessageDescriptorSource(cell.value)}>
              <Value>{i18n._(cell.value)}</Value>
              <Label>{i18n._(cell.label)}</Label>
            </Cell>
          ))}
        </Grid>
      </Frame>
    </SectionShell>
  );
}
