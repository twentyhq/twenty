'use client';

import { styled } from '@linaria/react';
import NextImage from 'next/image';

import {
  Body,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { useAnimatedNumber } from '@/lib/animation';
import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';

import { PlanFeatureList } from './PlanFeatureList';
import { useFeatureTransition } from './use-feature-transition';

const StyledCard = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid transparent;
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  overflow: visible;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(4)};
  }
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  gap: ${theme.spacing(4)};
`;

const cardPlanTitleClassName = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-size='xs'] {
    line-height: ${theme.lineHeight(5)};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='xs'] {
      line-height: ${theme.lineHeight(6)};
    }
  }
`;

const priceBodyClassName = css`
  color: ${theme.colors.primary.text[60]};
  display: block;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const PriceLine = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1)};
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-wrap: nowrap;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const CardRule = styled.div`
  border-top: 1px dotted ${theme.colors.primary.border[10]};
  flex-shrink: 0;
  height: 0;
  width: 100%;
`;

const CardIcon = styled.div<{ $iconWidth: number }>`
  background-color: ${theme.colors.primary.background[100]};
  border: none;
  border-radius: ${theme.radius(2)};
  display: block;
  flex-shrink: 0;
  height: 80px;
  margin-left: auto;
  overflow: hidden;
  position: relative;
  width: ${({ $iconWidth }) => `${$iconWidth}px`};

  img {
    object-fit: contain;
    object-position: center right;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    margin-left: auto;
    height: 80px;
    width: ${({ $iconWidth }) => `${$iconWidth}px`};
  }
`;

const CtaWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;

  > * {
    display: flex;
    width: 100%;
  }
`;

const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

type CardProps = {
  card: PlanCardType;
  highlighted?: boolean;
  maxBullets: number;
};

export function Card({ card, highlighted = false, maxBullets }: CardProps) {
  const { i18n } = useLingui();
  const iconWidth = card.icon.width ?? 80;
  const animatedPriceValue = useAnimatedNumber(card.price.value);
  const { comparisonBulletTexts, phase, visibleBullets } = useFeatureTransition(
    card.features.bullets,
  );

  return (
    <StyledCard>
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={cardPlanTitleClassName}
            size="xs"
            weight="light"
          >
            <HeadingPart fontFamily="sans">{i18n._(card.heading)}</HeadingPart>
          </Heading>
          <PriceLine>
            <Heading as="h4" size="sm" weight="regular">
              <HeadingPart fontFamily="sans">
                {card.price.prefix}
                {PRICE_NUMBER_FORMATTER.format(animatedPriceValue)}
              </HeadingPart>
            </Heading>
            <Body as="span" className={priceBodyClassName} size="sm">
              {i18n._(card.price.suffix)}
            </Body>
          </PriceLine>
        </CardHeaderInfo>
        <CardIcon $iconWidth={iconWidth}>
          <NextImage
            alt={card.icon.alt}
            fill
            sizes={`${iconWidth}px`}
            src={card.icon.src}
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

      <CtaWrapper>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label={i18n._(msg`Start for free`)}
          variant={highlighted ? 'contained' : 'outlined'}
        />
      </CtaWrapper>
    </StyledCard>
  );
}
