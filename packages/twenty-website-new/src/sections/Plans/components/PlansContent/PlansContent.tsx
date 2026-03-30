'use client';

import { PLANS_DATA } from '@/app/pricing/constants/plans';
import type {
  PlansBillingPeriod,
  PlansHostingMode,
} from '@/sections/Plans/types';
import { getPlanCard } from '@/sections/Plans/utils';
import { useState } from 'react';
import { BillingToggle } from '../BillingToggle/BillingToggle';
import { Cards } from '../Cards/Cards';
import { SelfHostToggle } from '../SelfHostToggle/SelfHostToggle';

export function PlansContent() {
  const [billing, setBilling] = useState<PlansBillingPeriod>('yearly');
  const [hosting, setHosting] = useState<PlansHostingMode>('cloud');

  const proCard = getPlanCard(PLANS_DATA, 'pro', hosting, billing);
  const organizationCard = getPlanCard(
    PLANS_DATA,
    'organization',
    hosting,
    billing,
  );

  return (
    <>
      <BillingToggle billing={billing} onBillingChange={setBilling} />
      <SelfHostToggle hosting={hosting} onHostingChange={setHosting} />
      <Cards organization={organizationCard} pro={proCard} />
    </>
  );
}
