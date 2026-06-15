import { styled } from '@linaria/react';

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

import { type CaseStudyKpi } from '@/case-studies';

const KpiGrid = styled.div`
  border-top: 1px solid ${color('black-10')};
  display: grid;

  &[data-count='1'] {
    grid-template-columns: minmax(0, 1fr);
  }

  &[data-count='2'],
  &[data-count='3'] {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &[data-count='3'] > *:nth-child(n + 3) {
    border-top: 1px solid ${color('black-10')};
  }

  ${mediaUp('md')} {
    &[data-count='3'] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &[data-count='3'] > *:nth-child(n + 3) {
      border-top: none;
    }
  }
`;

const KpiCell = styled.div`
  border-left: 1px solid ${color('black-10')};
  display: flex;
  flex-direction: column;
  padding: ${spacing(4)} ${spacing(3)};

  & > * + * {
    margin-top: ${spacing(1.5)};
  }

  &:nth-child(odd) {
    border-left: none;
    padding-left: 0;
  }

  ${mediaUp('md')} {
    padding: ${spacing(5)} ${spacing(4)};

    &:nth-child(odd) {
      border-left: 1px solid ${color('black-10')};
      padding-left: ${spacing(4)};
    }

    &:first-child {
      border-left: none;
      padding-left: 0;
    }
  }
`;

const KpiValue = styled.span`
  ${typeRampDeclarations('headingXs')}
  color: ${color('black')};
  font-family: ${fontFamily('serif')};
  font-weight: ${FONT_WEIGHT.light};
`;

const KpiLabel = styled.span`
  color: ${color('black-40')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  margin-top: ${spacing(1)};
  padding: 0 ${spacing(6)} ${spacing(4)};

  ${mediaUp('md')} {
    padding-bottom: ${spacing(5)};
  }
`;

const Chip = styled.span`
  align-items: center;
  background-color: ${color('black-5')};
  border: 1px solid ${color('black-10')};
  border-radius: 999px;
  color: ${color('black-60')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  gap: ${spacing(2.5)};
  padding: ${spacing(1.5)} ${spacing(3.5)};
  white-space: nowrap;
`;

const ChipValue = styled.span`
  color: ${color('black')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
`;

const ChipDivider = styled.span`
  background-color: ${color('black-20')};
  flex-shrink: 0;
  height: 14px;
  width: 1px;
`;

const ChipLabel = styled.span`
  color: ${color('black-60')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export type CaseStudyCardKpisProps = {
  kpis: readonly CaseStudyKpi[];
  variant: 'default' | 'large';
};

export function CaseStudyCardKpis({ kpis, variant }: CaseStudyCardKpisProps) {
  const i18n = getServerI18n();

  if (variant === 'large') {
    return (
      <KpiGrid data-count={kpis.length}>
        {kpis.map((kpi) => (
          <KpiCell key={getMessageDescriptorSource(kpi.value)}>
            <KpiValue>{i18n._(kpi.value)}</KpiValue>
            <KpiLabel>{i18n._(kpi.label)}</KpiLabel>
          </KpiCell>
        ))}
      </KpiGrid>
    );
  }

  return (
    <ChipRow>
      {kpis.map((kpi) => (
        <Chip key={getMessageDescriptorSource(kpi.value)}>
          <ChipValue>{i18n._(kpi.value)}</ChipValue>
          <ChipDivider aria-hidden />
          <ChipLabel>{i18n._(kpi.label)}</ChipLabel>
        </Chip>
      ))}
    </ChipRow>
  );
}
