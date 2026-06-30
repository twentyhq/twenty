import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { type DashboardKpi } from '../types/dashboard-kpi';

const Body = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
`;

const Label = styled.span`
  color: ${THEME_LIGHT.font.color.secondary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const Value = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xxl)};
  font-variant-numeric: tabular-nums;
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  line-height: 1.1;
`;

const Trend = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 2px;
`;

const TrendIcon = styled.span`
  align-items: center;
  display: inline-flex;

  &[data-direction='up'] {
    color: ${THEME_LIGHT.color.turquoise8};
  }
  &[data-direction='down'] {
    color: ${THEME_LIGHT.color.red8};
  }
`;

const TrendPercent = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.xs)};
`;

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const { i18n } = useLingui();

  return (
    <Body>
      <Label>{i18n._(kpi.label)}</Label>
      <Value>{kpi.value}</Value>
      <Trend>
        <TrendIcon data-direction={kpi.trendDirection}>
          {kpi.trendDirection === 'up' ? (
            <IconTrendingUp size={14} stroke={2} />
          ) : (
            <IconTrendingDown size={14} stroke={2} />
          )}
        </TrendIcon>
        <TrendPercent>{kpi.trendPercent}%</TrendPercent>
      </Trend>
    </Body>
  );
}
