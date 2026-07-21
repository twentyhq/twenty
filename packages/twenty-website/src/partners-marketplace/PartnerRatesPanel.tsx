'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { formatUsdRate } from './format-usd-rate';
import { ProfileEyebrow } from './ProfileEyebrow';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Panel = styled.div`
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  padding: ${spacing(5.5)};
  width: 100%;
`;

const Row = styled.div`
  align-items: baseline;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;
  padding-block: ${spacing(3.5)};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }
`;

const Label = styled.span`
  color: ${semanticColor.inkMuted};
  flex: 1 1 auto;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.06em;
  min-width: 0;
  text-transform: uppercase;
`;

const Value = styled.span`
  color: ${semanticColor.ink};
  flex: 0 0 auto;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  text-align: right;
  white-space: nowrap;
`;

export function PartnerRatesPanel({
  hourlyRateUsd,
  projectBudgetMinUsd,
}: {
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
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

  if (rows.length === 0) return null;

  return (
    <Wrapper>
      <ProfileEyebrow>{i18n._(msg`Rates`)}</ProfileEyebrow>
      <Panel>
        {rows.map((row) => (
          <Row key={row.label}>
            <Label>{row.label}</Label>
            <Value>{row.value}</Value>
          </Row>
        ))}
      </Panel>
    </Wrapper>
  );
}
