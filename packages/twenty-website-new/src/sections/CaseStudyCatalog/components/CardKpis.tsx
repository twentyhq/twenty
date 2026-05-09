import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

type Kpi = {
  label: MessageDescriptor;
  value: MessageDescriptor;
};

const KpiRow = styled.div<{ count: number }>`
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: grid;
  grid-template-columns: repeat(
    ${({ count }) => (count > 2 ? 2 : count)},
    minmax(0, 1fr)
  );
  margin-top: ${theme.spacing(2)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: ${({ count }) => `repeat(${count}, minmax(0, 1fr))`};
    margin-top: auto;
  }
`;

const KpiCell = styled.div<{ index: number; count: number }>`
  border-left: 1px solid ${theme.colors.primary.border[10]};
  border-top: ${({ index, count }) =>
    count > 2 && index >= 2
      ? `1px solid ${theme.colors.primary.border[10]}`
      : 'none'};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
  padding: ${theme.spacing(4)} ${theme.spacing(3)};

  &:nth-child(odd) {
    border-left: none;
    padding-left: 0;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    border-left: 1px solid ${theme.colors.primary.border[10]};
    border-top: none;
    padding: ${theme.spacing(5)} ${theme.spacing(4)};

    &:first-child {
      border-left: none;
      padding-left: 0;
    }

    &:nth-child(odd) {
      border-left: 1px solid ${theme.colors.primary.border[10]};
      padding-left: ${theme.spacing(4)};
    }

    &:first-child {
      border-left: none;
      padding-left: 0;
    }
  }
`;

const KpiValue = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(7)};

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(7)};
    line-height: ${theme.lineHeight(8)};
  }
`;

const KpiLabel = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

const KpiChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(1)};
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(5)};
  }
`;

const KpiChip = styled.span`
  align-items: center;
  background-color: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2.5)};
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3.5)};
  white-space: nowrap;
`;

const KpiChipValue = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: -0.01em;
`;

const KpiChipDivider = styled.span`
  background-color: ${theme.colors.primary.border[20]};
  flex-shrink: 0;
  height: 14px;
  width: 1px;
`;

const KpiChipLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

type CardKpisLargeProps = {
  kpis: Kpi[];
  variant: 'large';
};

type CardKpisDefaultProps = {
  kpis: Kpi[];
  variant: 'default';
};

export function CardKpisLarge({ kpis }: CardKpisLargeProps) {
  const i18n = getServerI18n();

  return (
    <KpiRow count={kpis.length}>
      {kpis.map((kpi, kpiIndex) => (
        <KpiCell count={kpis.length} index={kpiIndex} key={kpiIndex}>
          <KpiValue>{i18n._(kpi.value)}</KpiValue>
          <KpiLabel>{i18n._(kpi.label)}</KpiLabel>
        </KpiCell>
      ))}
    </KpiRow>
  );
}

export function CardKpisDefault({ kpis }: CardKpisDefaultProps) {
  const i18n = getServerI18n();

  return (
    <KpiChipRow>
      {kpis.map((kpi, kpiIndex) => (
        <KpiChip key={kpiIndex}>
          <KpiChipValue>{i18n._(kpi.value)}</KpiChipValue>
          <KpiChipDivider aria-hidden />
          <KpiChipLabel>{i18n._(kpi.label)}</KpiChipLabel>
        </KpiChip>
      ))}
    </KpiChipRow>
  );
}
