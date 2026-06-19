'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  spacing,
} from '@/tokens';

import { type PlansBillingPeriod } from './plans-data';

const ToggleTrack = styled.div`
  align-items: center;
  background-color: ${color('black-10')};
  border-radius: ${radius(20)};
  display: inline-flex;
  padding: 2px;
`;

// The active option carries the white pill, sized to its own content (so
// Monthly stays narrow and Yearly holds its badge). It is driven by the
// active period, not by measurement, so it is correct on the first paint
// with no load-time jump; the pill crossfades when the period changes.
const ToggleOption = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: ${radius(8)};
  color: ${color('black-60')};
  column-gap: ${spacing(2)};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 28px;
  justify-content: center;
  line-height: 1.35;
  padding-left: ${spacing(3)};
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
  white-space: nowrap;

  &[data-period='monthly'] {
    padding-right: ${spacing(3)};
  }

  &[data-period='yearly'] {
    padding-right: ${spacing(0.5)};
  }

  &[data-active] {
    background-color: ${color('white')};
    color: ${color('black')};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const DiscountBadge = styled.span`
  align-items: center;
  background-color: ${color('blue')};
  border-radius: ${radius(12)};
  color: ${color('white')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 24px;
  justify-content: center;
  padding-inline: ${spacing(1.5)};
`;

export function BillingToggle({
  billing,
  onBillingChange,
}: {
  billing: PlansBillingPeriod;
  onBillingChange: (billing: PlansBillingPeriod) => void;
}) {
  const { i18n } = useLingui();

  return (
    <ToggleTrack aria-label={i18n._(msg`Billing period`)} role="radiogroup">
      <ToggleOption
        aria-checked={billing === 'monthly'}
        data-active={billing === 'monthly' ? '' : undefined}
        data-period="monthly"
        onClick={() => onBillingChange('monthly')}
        role="radio"
        type="button"
      >
        {i18n._(msg`Monthly`)}
      </ToggleOption>
      <ToggleOption
        aria-checked={billing === 'yearly'}
        data-active={billing === 'yearly' ? '' : undefined}
        data-period="yearly"
        onClick={() => onBillingChange('yearly')}
        role="radio"
        type="button"
      >
        {i18n._(msg`Yearly`)}
        <DiscountBadge>-25%</DiscountBadge>
      </ToggleOption>
    </ToggleTrack>
  );
}
