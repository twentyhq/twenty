'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { useAnimatedNumber } from '@/platform/motion';
import { color, radius, semanticColor, spacing } from '@/tokens';
import { Body, Button, Heading } from '@/ui';

import {
  PLANS_DATA,
  type PlansBillingPeriod,
  type PlansTierId,
} from './plans-data';
import { PlanFeatureList } from './plan-feature-list';
import { type PlansHostingMode } from './pricing-state-context';
import { useFeatureTransition } from './use-feature-transition';

const CardShell = styled.div`
  background-color: ${color('white')};
  border: 1px solid transparent;
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: ${spacing(4)};
  position: relative;
  z-index: 1;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const PriceLine = styled.div`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
`;

const PriceSuffix = styled.span`
  color: ${color('black-60')};
  display: block;
  min-width: 0;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  flex-shrink: 0;
  height: 0;
  width: 100%;
`;

const CardIcon = styled.div<{ $widthPx: number }>`
  border-radius: ${radius(2)};
  flex-shrink: 0;
  height: 80px;
  margin-left: auto;
  overflow: hidden;
  position: relative;
  width: ${({ $widthPx }) => `${$widthPx}px`};

  img {
    object-fit: contain;
    object-position: center right;
  }
`;

const CtaRow = styled.div`
  flex-shrink: 0;
  width: 100%;

  > * {
    display: flex;
    width: 100%;
  }
`;

const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function PlanCard({
  billing,
  highlighted = false,
  hosting,
  maxBullets,
  tierId,
}: {
  billing: PlansBillingPeriod;
  highlighted?: boolean;
  hosting: PlansHostingMode;
  maxBullets: number;
  tierId: PlansTierId;
}) {
  const { i18n } = useLingui();
  const tier = PLANS_DATA[tierId];
  const cell = tier.cells[hosting][billing];
  const iconWidth = tier.icon.widthPx ?? 80;
  const animatedPriceValue = useAnimatedNumber(cell.price.value);
  const { comparisonBulletTexts, phase, visibleBullets } = useFeatureTransition(
    cell.featureBullets,
  );

  return (
    <CardShell>
      <CardHeader>
        <CardHeaderInfo>
          <Heading as="h3" size="xs" weight="light">
            {`*${i18n._(tier.heading)}*`}
          </Heading>
          <PriceLine>
            <Heading as="h4" size="sm" weight="regular">
              {`*${cell.price.prefix}${PRICE_NUMBER_FORMATTER.format(animatedPriceValue)}*`}
            </Heading>
            <Body as="span" size="sm">
              <PriceSuffix>{i18n._(cell.price.suffix)}</PriceSuffix>
            </Body>
          </PriceLine>
        </CardHeaderInfo>
        <CardIcon $widthPx={iconWidth}>
          <NextImage
            alt={tier.icon.alt}
            fill
            sizes={`${iconWidth}px`}
            src={tier.icon.src}
          />
        </CardIcon>
      </CardHeader>

      <CardRule />

      <PlanFeatureList
        comparisonBulletTexts={comparisonBulletTexts}
        maxBullets={maxBullets}
        phase={phase}
        visibleBullets={visibleBullets}
      />

      <CtaRow>
        <Button
          href="https://app.twenty.com/welcome"
          label={i18n._(msg`Start for free`)}
          variant={highlighted ? 'filled' : 'outlined'}
        />
      </CtaRow>
    </CardShell>
  );
}
