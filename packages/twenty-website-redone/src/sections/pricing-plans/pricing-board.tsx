'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { HERO_COMPOSITION, mediaUp, spacing } from '@/tokens';

import { BillingToggle } from './billing-toggle';
import { PlanCard } from './plan-card';
import { PLANS_DATA, type PlansBillingPeriod } from './plans-data';
import { SelfHostToggle } from './self-host-toggle';
import { usePricingState } from './use-pricing-state';

// The interactive island below the intro: the switcher and the cards.
// It sits 32px under the intro (the hero's intro-to-CTA gap); the cards
// hang 68px under the switcher (the hero's CTA-to-mockup measure).
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
    /* Nudged right of dead-centre so it does not read as left of the
       Selfhosting control that sits on the row's right. */
    transform: translateX(${spacing(3)});
  }
`;

const SelfHostToggleSlot = styled.div`
  justify-self: end;

  ${mediaUp('md')} {
    grid-column: 3;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  row-gap: ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    column-gap: ${spacing(6)};
    grid-template-columns: 1fr 1fr;
    row-gap: 0;
  }
`;

export function PricingBoard() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');
  const { hosting, setHosting } = usePricingState();

  const maxBullets = Math.max(
    PLANS_DATA.pro.cells[hosting][billing].featureBullets.length,
    PLANS_DATA.organization.cells[hosting][billing].featureBullets.length,
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
      <CardsGrid>
        <PlanCard
          billing={billing}
          hosting={hosting}
          maxBullets={maxBullets}
          tierId="pro"
        />
        <PlanCard
          billing={billing}
          highlighted
          hosting={hosting}
          maxBullets={maxBullets}
          tierId="organization"
        />
      </CardsGrid>
    </Board>
  );
}
