'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { mediaUp, spacing } from '@/tokens';
import { SectionShell } from '@/ui';

import { BillingToggle } from './billing-toggle';
import { PlanCard } from './plan-card';
import { PLANS_DATA, type PlansBillingPeriod } from './plans-data';
import { usePricingState } from './use-pricing-state';
import { SelfHostToggle } from './self-host-toggle';

const PlansStack = styled.div`
  display: grid;
  justify-items: center;
  margin-inline: auto;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
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
  row-gap: ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    column-gap: ${spacing(6)};
    grid-template-columns: 1fr 1fr;
    row-gap: 0;
  }
`;

export function PricingPlans() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');
  const { hosting, setHosting } = usePricingState();

  const maxBullets = Math.max(
    PLANS_DATA.pro.cells[hosting][billing].featureBullets.length,
    PLANS_DATA.organization.cells[hosting][billing].featureBullets.length,
  );

  return (
    <SectionShell scheme="muted">
      <PlansStack>
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
      </PlansStack>
    </SectionShell>
  );
}
