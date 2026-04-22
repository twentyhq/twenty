'use client';

import { PLANS_DATA } from '@/app/pricing/_constants/plans';
import { usePricingState } from '@/sections/Plans/context/PricingStateContext';
import type { PlansBillingPeriod } from '@/sections/Plans/types';
import { getPlanCard } from '@/sections/Plans/utils';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { BillingToggle } from '../BillingToggle/BillingToggle';
import { Cards } from '../Cards/Cards';
import { SelfHostToggle } from '../SelfHostToggle/SelfHostToggle';

const ControlsRow = styled.div`
  display: grid;
  row-gap: ${theme.spacing(4)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    grid-template-columns: 1fr auto 1fr;
  }
`;

const BillingToggleSlot = styled.div`
  justify-self: center;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: 2;
  }
`;

const SelfHostToggleSlot = styled.div`
  justify-self: end;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: 3;
  }
`;

export function PlansContent() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');
  const { hosting, setHosting } = usePricingState();

  const proCard = getPlanCard(PLANS_DATA, 'pro', hosting, billing);
  const organizationCard = getPlanCard(
    PLANS_DATA,
    'organization',
    hosting,
    billing,
  );

  return (
    <>
      <ControlsRow>
        <BillingToggleSlot>
          <BillingToggle billing={billing} onBillingChange={setBilling} />
        </BillingToggleSlot>
        <SelfHostToggleSlot>
          <SelfHostToggle hosting={hosting} onHostingChange={setHosting} />
        </SelfHostToggleSlot>
      </ControlsRow>
      <Cards organization={organizationCard} pro={proCard} />
    </>
  );
}
