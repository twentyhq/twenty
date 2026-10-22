'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  EASING,
  HERO_COMPOSITION,
  mediaUp,
  REDUCED_MOTION,
  spacing,
} from '@/tokens';

import { BillingToggle } from './BillingToggle';
import { FEATURE_TRANSITION_TIMING } from './feature-transition-timing';
import { getPlanCardRowTemplate } from './get-plan-card-row-template';
import { PlanCard } from './PlanCard';
import { PLANS_DATA, type PlansBillingPeriod } from './plans-data';
import { SelfHostToggle } from './SelfHostToggle';
import { usePricingState } from '@/pricing-state';

// Spacing echoes the hero: 32px intro-to-CTA, 68px CTA-to-mockup.
const Board = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: ${spacing(8)};
  width: 100%;
`;

const ControlsRow = styled.div`
  display: grid;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    align-items: center;
    grid-template-columns: 1fr auto 1fr;

    & > * + * {
      margin-top: 0;
    }
  }
`;

const BillingToggleSlot = styled.div`
  justify-self: center;

  ${mediaUp('md')} {
    grid-column: 2;
    /* Nudged right so it does not read as left of the Selfhosting control. */
    transform: translateX(${spacing(3)});
  }
`;

const SelfHostToggleSlot = styled.div`
  justify-self: end;

  ${mediaUp('md')} {
    grid-column: 3;
  }
`;

const CardsGrid = styled.div<{ $cardRowTemplate: string }>`
  display: grid;
  grid-template-columns: 1fr;
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  row-gap: ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    column-gap: ${spacing(6)};
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: ${({ $cardRowTemplate }) => $cardRowTemplate};
    row-gap: 0;
    transition: grid-template-rows
      ${FEATURE_TRANSITION_TIMING.switchMilliseconds}ms ${EASING.spring};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

export function PricingBoard() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');
  const { hosting, setHosting } = usePricingState();

  const featureCount = Math.max(
    PLANS_DATA.pro.cells[hosting][billing].features.length,
    PLANS_DATA.organization.cells[hosting][billing].features.length,
    PLANS_DATA.enterprise.cells[hosting][billing].features.length,
  );

  return (
    <Board>
      <ControlsRow>
        <BillingToggleSlot>
          <BillingToggle billing={billing} onBillingChange={setBilling} />
        </BillingToggleSlot>
        <SelfHostToggleSlot>
          <SelfHostToggle hosting={hosting} onHostingChange={setHosting} />
        </SelfHostToggleSlot>
      </ControlsRow>
      <CardsGrid $cardRowTemplate={getPlanCardRowTemplate(featureCount)}>
        <PlanCard billing={billing} hosting={hosting} tierId="pro" />
        <PlanCard
          billing={billing}
          highlighted
          hosting={hosting}
          tierId="organization"
        />
        <PlanCard billing={billing} hosting={hosting} tierId="enterprise" />
      </CardsGrid>
    </Board>
  );
}
