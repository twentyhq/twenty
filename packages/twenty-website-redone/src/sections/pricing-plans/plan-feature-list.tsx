'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { INFORMATIVE_MARKS } from '@/icons';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { color, EASING, REDUCED_MOTION, spacing } from '@/tokens';
import { Body } from '@/ui';

import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';
import { type FeatureTransitionPhase } from './use-feature-transition';

const FEATURE_SWITCH_ANIMATION_MS =
  FEATURE_TRANSITION_TIMING.switchMilliseconds;
const FEATURE_ITEM_STAGGER_MS = FEATURE_TRANSITION_TIMING.staggerMilliseconds;

const FEATURE_ITEM_EXPANDED_HEIGHT = spacing(8);
const FEATURE_ITEM_SPACING = spacing(4);
const FEATURE_LIST_ROW_LAYOUT_HEIGHT = spacing(5.5);

const FeaturesViewport = styled.div<{ $featuresHeight: string }>`
  flex: 1 1 auto;
  min-height: ${({ $featuresHeight }) => $featuresHeight};
  min-width: 0;
  overflow: hidden;
  position: relative;
  transition: min-height ${FEATURE_SWITCH_ANIMATION_MS}ms ${EASING.spring};

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const FeatureList = styled.ul`
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
  column-gap: ${spacing(2)};
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
    animation: pricingFeatureItemEnter ${FEATURE_SWITCH_ANIMATION_MS}ms
      ${EASING.spring} both;
    animation-delay: calc(
      ${({ $featureIndex }) => $featureIndex} * ${FEATURE_ITEM_STAGGER_MS}ms
    );
  }

  &[data-state='exiting'] {
    animation: pricingFeatureItemExit ${FEATURE_SWITCH_ANIMATION_MS}ms
      ${EASING.spring} both;
    animation-delay: calc(
      ${({ $featureIndex }) => $featureIndex} * ${FEATURE_ITEM_STAGGER_MS}ms
    );
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

function getLayoutMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }
  return `calc((${FEATURE_LIST_ROW_LAYOUT_HEIGHT} * ${maxBullets}) + (${FEATURE_ITEM_SPACING} * ${maxBullets - 1}))`;
}

function getAnimationMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }
  return `calc((${FEATURE_ITEM_EXPANDED_HEIGHT} * ${maxBullets}) + (${FEATURE_ITEM_SPACING} * ${maxBullets - 1}))`;
}

export function PlanFeatureList({
  comparisonBulletTexts,
  maxBullets,
  phase,
  visibleBullets,
}: {
  comparisonBulletTexts: Set<string>;
  maxBullets: number;
  phase: FeatureTransitionPhase;
  visibleBullets: MessageDescriptor[];
}) {
  const { i18n } = useLingui();
  const CheckMark = INFORMATIVE_MARKS.check;

  return (
    <FeaturesViewport
      $featuresHeight={
        phase === 'stable'
          ? getLayoutMinHeight(maxBullets)
          : getAnimationMinHeight(maxBullets)
      }
    >
      <FeatureList data-state={phase}>
        {visibleBullets.map((bullet, bulletNumber) => (
          <FeatureItem
            $featureIndex={bulletNumber}
            $featureSpacing={bulletNumber > 0 ? FEATURE_ITEM_SPACING : '0px'}
            data-state={
              phase === 'stable' ||
              comparisonBulletTexts.has(getMessageDescriptorSource(bullet))
                ? 'stable'
                : phase
            }
            key={getMessageDescriptorSource(bullet)}
          >
            <FeatureCheck>
              <CheckMark color={color('blue')} sizePx={16} strokeWidth={1.5} />
            </FeatureCheck>
            <Body as="span" size="sm">
              {i18n._(bullet)}
            </Body>
          </FeatureItem>
        ))}
      </FeatureList>
    </FeaturesViewport>
  );
}
