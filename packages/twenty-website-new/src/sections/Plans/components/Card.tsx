'use client';

import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { Body, Heading, LinkButton } from '@/design-system/components';
import { CheckIcon } from '@/icons/informative/Check';
import { useAnimatedNumber } from '@/lib/animation';
import { getMessageDescriptorSource } from '@/lib/i18n/get-message-descriptor-source';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { useTimeoutRegistry } from '@/lib/react';
import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { useEffect, useState } from 'react';

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

const FEATURES_SWITCH_ANIMATION_MS = 110;
const FEATURE_ITEM_STAGGER_MS = 8;
const FEATURE_ITEM_EXPANDED_HEIGHT = theme.spacing(8);
const FEATURE_ITEM_SPACING = theme.spacing(4);
const FEATURE_LIST_ROW_LAYOUT_HEIGHT = theme.spacing(5.5);

const FeaturesViewport = styled.div<{ $featuresHeight: string }>`
  flex: 1 1 auto;
  min-height: ${({ $featuresHeight }) => $featuresHeight};
  min-width: 0;
  overflow: hidden;
  position: relative;
  transition: min-height ${FEATURES_SWITCH_ANIMATION_MS}ms
    cubic-bezier(0.2, 0.8, 0.2, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FeaturesList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  min-width: 0;
  padding: 0;
  width: 100%;
`;

const FeatureCheck = styled.span`
  align-items: center;
  display: inline-flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FeatureItem = styled.li<{
  $featureIndex: number;
  $featureSpacing: string;
}>`
  @keyframes pricingFeatureItemEnter {
    from {
      margin-top: 0;
      max-height: 0;
      opacity: 0;
    }

    to {
      margin-top: ${({ $featureSpacing }) => $featureSpacing};
      max-height: ${FEATURE_ITEM_EXPANDED_HEIGHT};
      opacity: 1;
    }
  }

  @keyframes pricingFeatureItemExit {
    from {
      margin-top: ${({ $featureSpacing }) => $featureSpacing};
      max-height: ${FEATURE_ITEM_EXPANDED_HEIGHT};
      opacity: 1;
    }

    to {
      margin-top: 0;
      max-height: 0;
      opacity: 0;
    }
  }

  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto 1fr;
  margin-top: ${({ $featureSpacing }) => $featureSpacing};
  max-height: ${FEATURE_ITEM_EXPANDED_HEIGHT};
  min-width: 0;
  overflow: hidden;

  &[data-state='stable'] {
    max-height: none;
  }

  &[data-state='entering'] {
    animation: pricingFeatureItemEnter ${FEATURES_SWITCH_ANIMATION_MS}ms
      cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(
      ${({ $featureIndex }) => $featureIndex} * ${FEATURE_ITEM_STAGGER_MS}ms
    );
  }

  &[data-state='exiting'] {
    animation: pricingFeatureItemExit ${FEATURES_SWITCH_ANIMATION_MS}ms
      cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(
      ${({ $featureIndex }) => $featureIndex} * ${FEATURE_ITEM_STAGGER_MS}ms
    );
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type CardProps = {
  card: PlanCardType;
  highlighted?: boolean;
  maxBullets: number;
};

const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');
const PRICE_HEADING_NUMBER_REGEX = /^(.*?)(\d[\d,]*)(.*)$/;

function getHeadingSegments(heading: PlanCardType['price']['heading']) {
  return Array.isArray(heading) ? heading : [heading];
}

function getPriceHeadingNumericValue(
  heading: PlanCardType['price']['heading'],
) {
  const segments = getHeadingSegments(heading);

  for (const segment of segments) {
    const match = getMessageDescriptorSource(segment.text).match(
      PRICE_HEADING_NUMBER_REGEX,
    );

    if (!match) {
      continue;
    }

    return Number(match[2].replaceAll(',', ''));
  }

  return null;
}

function getAnimatedPriceHeading(
  heading: PlanCardType['price']['heading'],
  animatedValue: number,
) {
  const originalIsArray = Array.isArray(heading);
  let replaced = false;

  const nextSegments = getHeadingSegments(heading).map((segment) => {
    if (replaced) {
      return segment;
    }

    const match = getMessageDescriptorSource(segment.text).match(
      PRICE_HEADING_NUMBER_REGEX,
    );

    if (!match) {
      return segment;
    }

    replaced = true;

    return {
      ...segment,
      text: `${match[1]}${PRICE_NUMBER_FORMATTER.format(animatedValue)}${match[3]}`,
    };
  });

  return originalIsArray ? nextSegments : nextSegments[0];
}

function getBulletsKey(bullets: PlanCardType['features']['bullets']) {
  return bullets
    .map((bullet) => getMessageDescriptorSource(bullet.text))
    .join('||');
}

function getFeaturesLayoutMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }

  return `calc((${FEATURE_LIST_ROW_LAYOUT_HEIGHT} * ${maxBullets}) + (${theme.spacing(
    4,
  )} * ${maxBullets - 1}))`;
}

function getFeaturesAnimationMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }

  return `calc((${FEATURE_ITEM_EXPANDED_HEIGHT} * ${maxBullets}) + (${theme.spacing(
    4,
  )} * ${maxBullets - 1}))`;
}

export function Card({ card, highlighted = false, maxBullets }: CardProps) {
  const renderText = useRenderMessage();
  const timeoutRegistry = useTimeoutRegistry();
  const iconWidth = card.icon.width ?? 80;
  const targetPriceValue = getPriceHeadingNumericValue(card.price.heading);
  const animatedPriceValue = useAnimatedNumber(targetPriceValue ?? 0);
  const animatedPriceHeading =
    targetPriceValue === null
      ? card.price.heading
      : getAnimatedPriceHeading(card.price.heading, animatedPriceValue);
  const [visibleBullets, setVisibleBullets] = useState(card.features.bullets);
  const [queuedBullets, setQueuedBullets] = useState<
    PlanCardType['features']['bullets'] | null
  >(null);
  const [comparisonBullets, setComparisonBullets] = useState<
    PlanCardType['features']['bullets'] | null
  >(null);
  const [featuresPhase, setFeaturesPhase] = useState<
    'stable' | 'exiting' | 'entering'
  >('stable');

  useEffect(() => {
    const nextBullets = card.features.bullets;
    const nextBulletsKey = getBulletsKey(nextBullets);

    if (
      nextBulletsKey === getBulletsKey(visibleBullets) ||
      nextBulletsKey === getBulletsKey(queuedBullets ?? [])
    ) {
      return;
    }

    setQueuedBullets(nextBullets);

    if (featuresPhase === 'stable') {
      setFeaturesPhase('exiting');
    }
  }, [card.features.bullets, featuresPhase, queuedBullets, visibleBullets]);

  useEffect(() => {
    if (featuresPhase !== 'exiting' || !queuedBullets) {
      return;
    }

    return timeoutRegistry.schedule(
      () => {
        setComparisonBullets(visibleBullets);
        setVisibleBullets(queuedBullets);
        setQueuedBullets(null);
        setFeaturesPhase('entering');
      },
      FEATURES_SWITCH_ANIMATION_MS +
        FEATURE_ITEM_STAGGER_MS * visibleBullets.length,
    );
  }, [featuresPhase, queuedBullets, timeoutRegistry, visibleBullets]);

  useEffect(() => {
    if (featuresPhase !== 'entering') {
      return;
    }

    return timeoutRegistry.schedule(
      () => {
        setComparisonBullets(null);
        setFeaturesPhase('stable');
      },
      FEATURES_SWITCH_ANIMATION_MS +
        FEATURE_ITEM_STAGGER_MS * visibleBullets.length,
    );
  }, [featuresPhase, timeoutRegistry, visibleBullets]);

  const comparisonBulletTexts = new Set(
    (featuresPhase === 'exiting' ? queuedBullets : comparisonBullets)?.map(
      (bullet) => getMessageDescriptorSource(bullet.text),
    ) ?? [],
  );

  return (
    <StyledCard>
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={cardPlanTitleClassName}
            renderText={renderText}
            segments={card.heading}
            size="xs"
            weight="light"
          />
          <PriceLine>
            <Heading
              as="h4"
              renderText={renderText}
              segments={animatedPriceHeading}
              size="sm"
              weight="regular"
            />
            <Body
              as="span"
              body={card.price.body}
              className={priceBodyClassName}
              renderText={renderText}
              size="sm"
            />
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

      <FeaturesViewport
        $featuresHeight={
          featuresPhase === 'stable'
            ? getFeaturesLayoutMinHeight(maxBullets)
            : getFeaturesAnimationMinHeight(maxBullets)
        }
      >
        <FeaturesList data-state={featuresPhase}>
          {visibleBullets.map((bullet, index) => (
            <FeatureItem
              $featureIndex={index}
              $featureSpacing={index > 0 ? FEATURE_ITEM_SPACING : '0px'}
              data-state={
                featuresPhase === 'stable'
                  ? 'stable'
                  : comparisonBulletTexts.has(
                        getMessageDescriptorSource(bullet.text),
                      )
                    ? 'stable'
                    : featuresPhase
              }
              key={`${getMessageDescriptorSource(bullet.text)}-${index}`}
            >
              <FeatureCheck>
                <CheckIcon
                  color={theme.colors.highlight[100]}
                  size={16}
                  strokeWidth={1.5}
                />
              </FeatureCheck>
              <Body as="span" body={bullet} renderText={renderText} size="sm" />
            </FeatureItem>
          ))}
        </FeaturesList>
      </FeaturesViewport>

      <CtaWrapper>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label={renderText(msg`Start for free`)}
          variant={highlighted ? 'contained' : 'outlined'}
        />
      </CtaWrapper>
    </StyledCard>
  );
}
