'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { formatUsdRate } from '@/lib/format/format-usd';
import { theme } from '@/theme';

// Quiet fact list, not a card. A single hairline separates it from the CTAs
// above; values are modest sans so rates read as a footnote, not the headline.
const Panel = styled.section`
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  padding-top: ${theme.spacing(5)};
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
  gap: ${theme.spacing(3)};
  justify-content: space-between;
`;

const Label = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
`;

const Value = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.medium};
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
