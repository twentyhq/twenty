'use client';

import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { TalkToUsButton } from '@/contact-cal';
import { useAnimatedNumber } from '@/platform/motion';
import {
  color,
  EASING,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, Heading } from '@/ui';

import {
  PLANS_DATA,
  type PlansBillingPeriod,
  type PlansTierId,
} from './plans-data';
import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';
import { getPlanCardRowTemplate } from './get-plan-card-row-template';
import { getPlanFeatureKey } from './get-plan-feature-key';
import { PlanFeatureList } from './PlanFeatureList';
import { type PlansHostingMode } from '@/pricing-state';
import { useFeatureTransition } from './use-feature-transition';

const CardShell = styled.div<{ $rowTemplate: string }>`
  background-color: ${color('white')};
  border: 1px solid transparent;
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: ${({ $rowTemplate }) => $rowTemplate};
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: ${spacing(4)};
  position: relative;
  transition: grid-template-rows
    ${FEATURE_TRANSITION_TIMING.switchMilliseconds}ms ${EASING.spring};
  z-index: 1;

  &[data-highlighted] {
    border-color: ${color('blue')};
  }

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }

  ${mediaUp('md')} {
    grid-row: 1 / -1;
    grid-template-rows: subgrid;
  }
`;

const CardHeader = styled.div<{ $iconWidthPx: number }>`
  flex-shrink: 0;
  padding-right: ${({ $iconWidthPx }) =>
    `calc(${$iconWidthPx}px + ${spacing(3)})`};
  position: relative;
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

// Guards long localized strings where the two cards share the row on desktop.
const titleClassName = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const taglineClassName = css`
  color: ${color('black-60')};
`;

const PriceLine = styled.div`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  min-width: 0;

  && {
    margin-top: ${spacing(6)};
  }

  ${mediaUp('md')} {
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const priceSuffixClassName = css`
  color: ${color('black-60')};
  display: block;
  min-width: 0;

  ${mediaUp('md')} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const priceQualifierClassName = css`
  color: ${color('black-60')};
  flex-shrink: 0;
`;

const featuresClassName = css`
  grid-row: 4 / -2;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  flex-shrink: 0;
  height: 0;
  width: 100%;

  && {
    margin-top: ${spacing(6)};
  }
`;

const CardIcon = styled.div<{ $widthPx: number }>`
  border-radius: ${radius(2)};
  height: 80px;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  width: ${({ $widthPx }) => `${$widthPx}px`};

  img {
    object-fit: contain;
    object-position: right top;
  }
`;

const CtaRow = styled.div`
  flex-shrink: 0;
  grid-row: -2 / -1;
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
  tierId,
}: {
  billing: PlansBillingPeriod;
  highlighted?: boolean;
  hosting: PlansHostingMode;
  tierId: PlansTierId;
}) {
  const { i18n } = useLingui();
  const tier = PLANS_DATA[tierId];
  const cell = tier.cells[hosting][billing];
  const cta = tier.cta[hosting];
  const iconWidth = tier.icon.widthPx ?? 80;
  const animatedPriceValue = useAnimatedNumber(cell.price.value);
  const { comparisonItemKeys, phase, visibleItems } = useFeatureTransition(
    cell.features,
    getPlanFeatureKey,
  );

  return (
    <CardShell
      $rowTemplate={getPlanCardRowTemplate(cell.features.length)}
      data-highlighted={highlighted ? '' : undefined}
    >
      <CardHeader $iconWidthPx={iconWidth}>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={titleClassName}
            family="sans"
            size="xs"
            weight="medium"
          >
            {i18n._(tier.heading[hosting])}
          </Heading>
          <Body as="p" className={taglineClassName} size="sm" weight="medium">
            {i18n._(tier.tagline[hosting])}
          </Body>
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

      <PriceLine>
        {cell.price.qualifier !== undefined && (
          <Body as="span" className={priceQualifierClassName} size="sm">
            {i18n._(cell.price.qualifier)}
          </Body>
        )}
        <Heading as="h4" family="sans" size="sm" weight="medium">
          {`${cell.price.prefix}${PRICE_NUMBER_FORMATTER.format(animatedPriceValue)}${cell.price.valueSuffix ?? ''}`}
        </Heading>
        <Body as="span" className={priceSuffixClassName} size="sm">
          {i18n._(cell.price.suffix)}
        </Body>
      </PriceLine>

      <CardRule />

      <PlanFeatureList
        className={featuresClassName}
        comparisonItemKeys={comparisonItemKeys}
        intro={tier.featuresIntro}
        phase={phase}
        visibleFeatures={visibleItems}
      />

      <CtaRow>
        {cta.href !== undefined ? (
          <Button
            href={cta.href}
            label={i18n._(cta.label)}
            variant={highlighted ? 'filled' : 'outlined'}
          />
        ) : (
          <TalkToUsButton
            label={cta.label}
            variant={highlighted ? 'filled' : 'outlined'}
          />
        )}
      </CtaRow>
    </CardShell>
  );
}
