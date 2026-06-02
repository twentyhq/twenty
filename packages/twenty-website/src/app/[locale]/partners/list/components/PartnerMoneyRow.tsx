'use client';

import { IconBriefcase, IconCurrencyDollar } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { formatUsdCompact } from '@/lib/format/format-usd';
import { theme } from '@/theme';

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
`;

const Pill = styled.span`
  align-items: center;
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[80]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(1.5)};
  line-height: 1;
  padding: ${theme.spacing(1.5)} ${theme.spacing(3)};
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
