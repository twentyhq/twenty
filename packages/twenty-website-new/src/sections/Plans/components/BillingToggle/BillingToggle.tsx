'use client';

import type { PlansBillingPeriod } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const ToggleTrack = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(10)};
  display: flex;
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(1.5)};
  padding-right: ${theme.spacing(1.5)};
  padding-top: ${theme.spacing(1)};
`;

const ToggleOption = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${theme.radius(9)};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  column-gap: ${theme.spacing(2)};
  justify-content: center;
  line-height: ${theme.lineHeight(4)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(3)};
  padding-top: ${theme.spacing(1)};
  text-transform: uppercase;
  white-space: nowrap;

  &[data-active='true'] {
    background-color: ${theme.colors.primary.background[100]};
    color: ${theme.colors.primary.text[100]};
  }

  &[data-active='false'] {
    color: ${theme.colors.primary.text[60]};
  }
`;

const DiscountBadge = styled.span`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(6)};
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
  padding-bottom: ${theme.spacing(1)};
  padding-left: ${theme.spacing(1)};
  padding-right: ${theme.spacing(1)};
  padding-top: ${theme.spacing(1)};
`;

type BillingToggleProps = {
  billing: PlansBillingPeriod;
  onBillingChange: (billing: PlansBillingPeriod) => void;
};

export function BillingToggle({
  billing,
  onBillingChange,
}: BillingToggleProps) {
  return (
    <ToggleTrack role="radiogroup" aria-label="Billing period">
      <ToggleOption
        aria-checked={billing === 'monthly'}
        data-active={billing === 'monthly'}
        onClick={() => onBillingChange('monthly')}
        role="radio"
        type="button"
      >
        Monthly
      </ToggleOption>
      <ToggleOption
        aria-checked={billing === 'yearly'}
        data-active={billing === 'yearly'}
        onClick={() => onBillingChange('yearly')}
        role="radio"
        type="button"
      >
        Yearly
        <DiscountBadge>-20%</DiscountBadge>
      </ToggleOption>
    </ToggleTrack>
  );
}
