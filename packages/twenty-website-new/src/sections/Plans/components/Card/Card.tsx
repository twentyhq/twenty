'use client';

import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { Body, Heading, LinkButton } from '@/design-system/components';
import { CheckIcon } from '@/icons/informative/Check';
import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

const StyledCard = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid transparent;
  border-radius: ${theme.radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  row-gap: ${theme.spacing(4)};
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
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
  height: 0;
  width: 100%;
`;

const CardIcon = styled.div`
  --card-icon-width: 80px;
  background-color: ${theme.colors.primary.background[100]};
  border: none;
  border-radius: ${theme.radius(2)};
  display: block;
  flex-shrink: 0;
  height: 80px;
  margin-left: auto;
  overflow: hidden;
  position: relative;
  width: var(--card-icon-width);

  img {
    object-fit: contain;
    object-position: center right;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    margin-left: auto;
    height: 80px;
    width: var(--card-icon-width);
  }
`;

const CtaWrapper = styled.div`
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

const FeaturesViewport = styled.div`
  height: var(--features-height, auto);
  min-width: 0;
  overflow: hidden;
  position: relative;
  transition: height ${FEATURES_SWITCH_ANIMATION_MS}ms
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

const FeatureItem = styled.li`
  @keyframes pricingFeatureItemEnter {
    from {
      margin-top: 0;
      max-height: 0;
      opacity: 0;
    }

    to {
      margin-top: var(--feature-spacing, 0px);
      max-height: var(--feature-item-height, ${FEATURE_ITEM_EXPANDED_HEIGHT});
      opacity: 1;
    }
  }

  @keyframes pricingFeatureItemExit {
    from {
      margin-top: var(--feature-spacing, 0px);
      max-height: var(--feature-item-height, ${FEATURE_ITEM_EXPANDED_HEIGHT});
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
  margin-top: var(--feature-spacing, 0px);
  max-height: var(--feature-item-height, ${FEATURE_ITEM_EXPANDED_HEIGHT});
  min-width: 0;
  overflow: hidden;

  &[data-state='entering'] {
    animation: pricingFeatureItemEnter ${FEATURES_SWITCH_ANIMATION_MS}ms
      cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--feature-index) * ${FEATURE_ITEM_STAGGER_MS}ms);
  }

  &[data-state='exiting'] {
    animation: pricingFeatureItemExit ${FEATURES_SWITCH_ANIMATION_MS}ms
      cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--feature-index) * ${FEATURE_ITEM_STAGGER_MS}ms);
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

const PRICE_ROLL_DURATION_MS = 500;
const PRICE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');
const PRICE_HEADING_NUMBER_REGEX = /^(.*?)(\d[\d,]*)(.*)$/;
const FEATURE_LIST_ROW_MIN_HEIGHT = theme.spacing(5.5);

const useAnimatedNumber = (target: number) => {
  const [display, setDisplay] = useState(target);
  const previousValueRef = useRef(target);

  useEffect(() => {
    const from = previousValueRef.current;
    previousValueRef.current = target;

    if (from === target) {
      return;
    }

    const start = performance.now();
    let animationFrameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / PRICE_ROLL_DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target]);

  return display;
};

function getHeadingSegments(heading: PlanCardType['price']['heading']) {
  return Array.isArray(heading) ? heading : [heading];
}

function getPriceHeadingNumericValue(heading: PlanCardType['price']['heading']) {
  const segments = getHeadingSegments(heading);

  for (const segment of segments) {
    const match = segment.text.match(PRICE_HEADING_NUMBER_REGEX);

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

    const match = segment.text.match(PRICE_HEADING_NUMBER_REGEX);

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
  return bullets.map((bullet) => bullet.text).join('||');
}

function getFeaturesMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }

  return `calc((${FEATURE_LIST_ROW_MIN_HEIGHT} * ${maxBullets}) + (${theme.spacing(
    4,
  )} * ${maxBullets - 1}))`;
}

export function Card({ card, highlighted = false, maxBullets }: CardProps) {
  const iconWidth = card.icon.width ?? 80;
  const iconStyle = {
    '--card-icon-width': `${iconWidth}px`,
  } as CSSProperties;
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

    const timeoutId = window.setTimeout(() => {
      setComparisonBullets(visibleBullets);
      setVisibleBullets(queuedBullets);
      setQueuedBullets(null);
      setFeaturesPhase('entering');
    }, FEATURES_SWITCH_ANIMATION_MS +
      FEATURE_ITEM_STAGGER_MS * visibleBullets.length);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [featuresPhase, queuedBullets, visibleBullets]);

  useEffect(() => {
    if (featuresPhase !== 'entering') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setComparisonBullets(null);
      setFeaturesPhase('stable');
    }, FEATURES_SWITCH_ANIMATION_MS +
      FEATURE_ITEM_STAGGER_MS * visibleBullets.length);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [featuresPhase, visibleBullets]);

  const comparisonBulletTexts = new Set(
    (featuresPhase === 'exiting' ? queuedBullets : comparisonBullets)?.map(
      (bullet) => bullet.text,
    ) ?? [],
  );

  return (
    <StyledCard>
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={cardPlanTitleClassName}
            segments={card.heading}
            size="xs"
            weight="light"
          />
          <PriceLine>
            <Heading
              as="h4"
              segments={animatedPriceHeading}
              size="sm"
              weight="regular"
            />
            <Body
              as="span"
              body={card.price.body}
              className={priceBodyClassName}
              size="sm"
            />
          </PriceLine>
        </CardHeaderInfo>
        <CardIcon style={iconStyle}>
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
        style={{
          '--features-height': getFeaturesMinHeight(maxBullets),
        } as CSSProperties}
      >
        <FeaturesList data-state={featuresPhase}>
          {visibleBullets.map((bullet, index) => (
            <FeatureItem
              data-state={
                featuresPhase === 'stable'
                  ? 'stable'
                  : comparisonBulletTexts.has(bullet.text)
                    ? 'stable'
                    : featuresPhase
              }
              key={bullet.text}
              style={
                {
                  '--feature-index': index,
                  '--feature-item-height': FEATURE_ITEM_EXPANDED_HEIGHT,
                  '--feature-spacing':
                    index > 0 ? FEATURE_ITEM_SPACING : '0px',
                } as CSSProperties
                }
              >
                <FeatureCheck>
                  <CheckIcon
                    color={theme.colors.highlight[100]}
                    size={16}
                    strokeWidth={1.5}
                  />
                </FeatureCheck>
                <Body as="span" body={bullet} size="sm" />
              </FeatureItem>
          ))}
        </FeaturesList>
      </FeaturesViewport>

      <CtaWrapper>
        <LinkButton
          color="secondary"
          href="https://app.twenty.com/welcome"
          label="Start for free"
          type="anchor"
          variant={highlighted ? 'contained' : 'outlined'}
        />
      </CtaWrapper>
    </StyledCard>
  );
}
