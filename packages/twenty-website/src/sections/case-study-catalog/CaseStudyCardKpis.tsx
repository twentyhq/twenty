import { styled } from '@linaria/react';

import { type CaseStudyKpi, CaseStudyStatGrid } from '@/case-studies';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  spacing,
} from '@/tokens';

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
  if (variant === 'large') {
    return <CaseStudyStatGrid cells={kpis} frame="card" />;
  }

  const i18n = getServerI18n();

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
