'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';

import { formatUsdRate } from './format-usd-rate';
import { ProfileEyebrow } from './ProfileEyebrow';

// A quiet fact list, not a card: a single hairline separates it from the CTAs
// above, and values stay modest so rates read as a footnote, not a headline.
const Panel = styled.div`
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  padding-top: ${spacing(5)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Row = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const Label = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
`;

const Value = styled.span`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
`;

export function PartnerRatesPanel({
  hourlyRateUsd,
  projectBudgetMinUsd,
  projectBudgetTypicalUsd,
}: {
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
  projectBudgetTypicalUsd: number | null;
}) {
  const { i18n } = useLingui();
  const rows: Array<{ label: string; value: string }> = [];

  const hourly = formatUsdRate(hourlyRateUsd);
  if (hourly) {
    rows.push({ label: i18n._(msg`Hourly`), value: i18n._(msg`${hourly}/hr`) });
  }
  const minimum = formatUsdRate(projectBudgetMinUsd);
  if (minimum) {
    rows.push({ label: i18n._(msg`Project minimum`), value: minimum });
  }
  const typical = formatUsdRate(projectBudgetTypicalUsd);
  if (typical) {
    rows.push({ label: i18n._(msg`Typical project`), value: typical });
  }

  if (rows.length === 0) return null;

  return (
    <Panel>
      <ProfileEyebrow>{i18n._(msg`Rates`)}</ProfileEyebrow>
      {rows.map((row) => (
        <Row key={row.label}>
          <Label>{row.label}</Label>
          <Value>{row.value}</Value>
        </Row>
      ))}
    </Panel>
  );
}
