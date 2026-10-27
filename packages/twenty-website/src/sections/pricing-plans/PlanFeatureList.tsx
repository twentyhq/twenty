'use client';

import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import {
  color,
  EASING,
  fontFamily,
  fontSize,
  REDUCED_MOTION,
  spacing,
} from '@/tokens';
import { Body } from '@/ui';

import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';
import { getPlanFeatureKey } from './get-plan-feature-key';
import { PLAN_FEATURE_ROW_METRICS } from './plan-feature-row-metrics';
import { PlanFeatureLogoStack } from './PlanFeatureLogoStack';
import { type PlanFeature, type PlanFeatureVisual } from './plans-data';
import { type FeatureTransitionPhase } from './use-feature-transition';

const FEATURE_SWITCH_ANIMATION_MS =
  FEATURE_TRANSITION_TIMING.switchMilliseconds;
const FEATURE_ITEM_STAGGER_MS = FEATURE_TRANSITION_TIMING.staggerMilliseconds;

const FEATURE_ITEM_SPACING = PLAN_FEATURE_ROW_METRICS.spacing;
const FEATURE_ICON_SIZE_PX = 18;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: subgrid;
  min-width: 0;
`;

const featuresIntroClassName = css`
  color: ${color('black-70')};
  margin-bottom: ${FEATURE_ITEM_SPACING};
`;

const FeatureList = styled.ul`
  display: grid;
  grid-row: 2 / -1;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: subgrid;
  list-style: none;
  min-width: 0;
  padding: 0;
`;

const FeatureVisualFrame = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: flex;
  height: calc(${fontSize(4)} * 1.55);
  justify-content: center;
`;

const FeatureText = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${spacing(0.5)};
  min-width: 0;
`;

const FeatureDescription = styled.span`
  color: ${color('black-70')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.3;
`;

const FeatureItem = styled.li<{
  $featureIndex: number;
  $featureSpacing: string;
}>`
  @keyframes pricingFeatureItemEnter {
    from {
      grid-template-rows: 0fr;
      margin-top: 0;
      opacity: 0;
    }

    to {
      grid-template-rows: 1fr;
      margin-top: ${({ $featureSpacing }) => $featureSpacing};
      opacity: 1;
    }
  }

  @keyframes pricingFeatureItemExit {
    from {
      grid-template-rows: 1fr;
      margin-top: ${({ $featureSpacing }) => $featureSpacing};
      opacity: 1;
    }

    to {
      grid-template-rows: 0fr;
      margin-top: 0;
      opacity: 0;
    }
  }

  align-self: start;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 1fr;
  margin-top: ${({ $featureSpacing }) => $featureSpacing};
  min-width: 0;

  &[data-state='entering'],
  &[data-state='exiting'] {
    overflow: hidden;
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

const FeatureRow = styled.div`
  align-items: start;
  column-gap: ${spacing(3)};
  display: grid;
  grid-template-columns: ${spacing(7)} minmax(0, 1fr);
  min-height: 0;
`;

function FeatureVisual({ visual }: { visual: PlanFeatureVisual }) {
  if (visual.kind === 'logos') {
    return <PlanFeatureLogoStack logos={visual.logos} />;
  }

  const FeatureIcon = visual.icon;

  return <FeatureIcon aria-hidden size={FEATURE_ICON_SIZE_PX} />;
}

export function PlanFeatureList({
  className,
  comparisonItemKeys,
  intro,
  phase,
  visibleFeatures,
}: {
  className?: string;
  comparisonItemKeys: Set<string>;
  intro: MessageDescriptor;
  phase: FeatureTransitionPhase;
  visibleFeatures: PlanFeature[];
}) {
  const { i18n } = useLingui();

  return (
    <FeaturesSection className={className}>
      <Body as="p" className={featuresIntroClassName} size="sm">
        {i18n._(intro)}
      </Body>
      <FeatureList data-state={phase}>
        {visibleFeatures.map((feature, featureNumber) => {
          const featureKey = getPlanFeatureKey(feature, featureNumber);

          return (
            <FeatureItem
              $featureIndex={featureNumber}
              $featureSpacing={featureNumber > 0 ? FEATURE_ITEM_SPACING : '0px'}
              data-state={
                phase === 'stable' || comparisonItemKeys.has(featureKey)
                  ? 'stable'
                  : phase
              }
              key={featureKey}
            >
              <FeatureRow>
                <FeatureVisualFrame>
                  <FeatureVisual visual={feature.visual} />
                </FeatureVisualFrame>
                <FeatureText>
                  <Body as="span" size="sm">
                    {i18n._(feature.title)}
                  </Body>
                  <FeatureDescription>
                    {i18n._(feature.description)}
                  </FeatureDescription>
                </FeatureText>
              </FeatureRow>
            </FeatureItem>
          );
        })}
      </FeatureList>
    </FeaturesSection>
  );
}
