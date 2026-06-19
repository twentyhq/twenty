'use client';

import { IconBriefcase, IconCurrencyDollar } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  fontFamily,
  FONT_WEIGHT,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';

import { formatUsdCompact } from './format-usd-compact';

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

const Pill = styled.span`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: 999px;
  color: ${color('black-80')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(1.5)};
  line-height: 1;
  padding: ${spacing(1.5)} ${spacing(3)};
`;

type PartnerMoneyRowProps = {
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
};

export function PartnerMoneyRow({
  hourlyRateUsd,
  projectBudgetMinUsd,
}: PartnerMoneyRowProps) {
  const { i18n } = useLingui();
  const hourly = formatUsdCompact(hourlyRateUsd);
  const minBudget = formatUsdCompact(projectBudgetMinUsd);

  if (!hourly && !minBudget) return null;

  return (
    <Row aria-label={i18n._(msg`Pricing`)}>
      {hourly && (
        <Pill>
          <IconCurrencyDollar size={14} aria-hidden="true" />
          {i18n._(msg`${hourly}/hr`)}
        </Pill>
      )}
      {minBudget && (
        <Pill>
          <IconBriefcase size={14} aria-hidden="true" />
          {i18n._(msg`from ${minBudget}`)}
        </Pill>
      )}
    </Row>
  );
}
