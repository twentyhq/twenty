'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { formatUsdRate } from '@/lib/format/format-usd';
import { theme } from '@/theme';

const Panel = styled.section`
  background-color: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(5)};
`;

const PanelEyebrow = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const Row = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Value = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
`;

type PartnerRatesPanelProps = {
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
  projectBudgetTypicalUsd: number | null;
};

export function PartnerRatesPanel({
  hourlyRateUsd,
  projectBudgetMinUsd,
  projectBudgetTypicalUsd,
}: PartnerRatesPanelProps) {
  const { i18n } = useLingui();
  const rows: Array<{ label: string; value: string }> = [];

  const hourly = formatUsdRate(hourlyRateUsd);
  if (hourly) {
    rows.push({ label: i18n._(msg`Hourly`), value: `${hourly}/hr` });
  }
  const min = formatUsdRate(projectBudgetMinUsd);
  if (min) {
    rows.push({ label: i18n._(msg`Project minimum`), value: min });
  }
  const typical = formatUsdRate(projectBudgetTypicalUsd);
  if (typical) {
    rows.push({ label: i18n._(msg`Typical project`), value: typical });
  }

  if (rows.length === 0) return null;

  return (
    <Panel aria-label={i18n._(msg`Rates`)}>
      <PanelEyebrow>{i18n._(msg`Rates`)}</PanelEyebrow>
      {rows.map((row) => (
        <Row key={row.label}>
          <Label>{row.label}</Label>
          <Value>{row.value}</Value>
        </Row>
      ))}
    </Panel>
  );
}
