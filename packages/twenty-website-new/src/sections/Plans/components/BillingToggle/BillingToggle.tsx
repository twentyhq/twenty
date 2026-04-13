'use client';

import type { PlansBillingPeriod } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const ToggleTrack = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(20)};
  display: flex;
  padding: ${theme.spacing(1)};
`;

const ToggleOption = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${theme.radius(8)};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  column-gap: ${theme.spacing(2)};
  height: ${theme.spacing(6)};
  justify-content: center;
  line-height: ${theme.lineHeight(4)};
  padding-left: ${theme.spacing(3)};
  text-transform: uppercase;
  white-space: nowrap;

  &[data-period='monthly'] {
    padding-right: ${theme.spacing(3)};
  }

  &[data-period='yearly'] {
    padding-right: ${theme.spacing(0.5)};
  }

  &[data-active='true'] {
    background-color: ${theme.colors.primary.background[100]};
    color: ${theme.colors.primary.text[100]};
  }

  &[data-active='false'] {
    color: ${theme.colors.primary.text[60]};
  }
`;

const ToggleLabel = styled.span`
  display: inline-flex;
  justify-content: center;
`;

const DiscountBadge = styled.span`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(12)};
  color: ${theme.colors.secondary.text[100]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  height: ${theme.spacing(5)};
  align-items: center;
  justify-content: center;
  line-height: ${theme.lineHeight(3.5)};
  padding-left: ${theme.spacing(1)};
  padding-right: ${theme.spacing(1)};
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
        data-period="monthly"
        onClick={() => onBillingChange('monthly')}
        role="radio"
        type="button"
      >
        <ToggleLabel>Monthly</ToggleLabel>
      </ToggleOption>
      <ToggleOption
        aria-checked={billing === 'yearly'}
        data-active={billing === 'yearly'}
        data-period="yearly"
        onClick={() => onBillingChange('yearly')}
        role="radio"
        type="button"
      >
        <ToggleLabel>Yearly</ToggleLabel>
        <DiscountBadge>-25%</DiscountBadge>
      </ToggleOption>
    </ToggleTrack>
  );
}
