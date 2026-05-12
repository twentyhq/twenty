'use client';

import { Body } from '@/design-system/components';
import { CheckIcon } from '@/icons/informative/Check';
import { getMessageDescriptorSource } from '@/lib/i18n/utils/get-message-descriptor-source';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { FEATURE_ITEM_STAGGER_MS } from './feature-item-stagger-ms';
import type { FeatureTransitionPhase } from './feature-transition-phase';

const FEATURES_SWITCH_ANIMATION_MS = 110;
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

const StyledList = styled.ul`
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

function getLayoutMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }

  return `calc((${FEATURE_LIST_ROW_LAYOUT_HEIGHT} * ${maxBullets}) + (${theme.spacing(4)} * ${maxBullets - 1}))`;
}

function getAnimationMinHeight(maxBullets: number) {
  if (maxBullets <= 0) {
    return '0px';
  }

  return `calc((${FEATURE_ITEM_EXPANDED_HEIGHT} * ${maxBullets}) + (${theme.spacing(4)} * ${maxBullets - 1}))`;
}

type PlanFeatureListProps = {
  comparisonBulletTexts: Set<string>;
  maxBullets: number;
  phase: FeatureTransitionPhase;
  visibleBullets: MessageDescriptor[];
};

export function PlanFeatureList({
  comparisonBulletTexts,
  maxBullets,
  phase,
  visibleBullets,
}: PlanFeatureListProps) {
  const { i18n } = useLingui();

  return (
    <FeaturesViewport
      $featuresHeight={
        phase === 'stable'
          ? getLayoutMinHeight(maxBullets)
          : getAnimationMinHeight(maxBullets)
      }
    >
      <StyledList data-state={phase}>
        {visibleBullets.map((bullet, index) => (
          <FeatureItem
            $featureIndex={index}
            $featureSpacing={index > 0 ? FEATURE_ITEM_SPACING : '0px'}
            data-state={
              phase === 'stable'
                ? 'stable'
                : comparisonBulletTexts.has(getMessageDescriptorSource(bullet))
                  ? 'stable'
                  : phase
            }
            key={`${getMessageDescriptorSource(bullet)}-${index}`}
          >
            <FeatureCheck>
              <CheckIcon
                color={theme.colors.highlight[100]}
                size={16}
                strokeWidth={1.5}
              />
            </FeatureCheck>
            <Body as="span" size="sm">
              {i18n._(bullet)}
            </Body>
          </FeatureItem>
        ))}
      </StyledList>
    </FeaturesViewport>
  );
}
