import { msg } from '@lingui/core/macro';

import { CreatorApplyStepVisual } from './creator-step-visuals/CreatorApplyStepVisual';
import { CreatorLinkStepVisual } from './creator-step-visuals/CreatorLinkStepVisual';
import { CreatorPayoutStepVisual } from './creator-step-visuals/CreatorPayoutStepVisual';
import { CommissionStepVisual } from './integrator-step-visuals/CommissionStepVisual';

// Shaped for ProductStepper's steps; same titles and bodies as before.
export const CREATOR_STEPPER_STEPS = [
  {
    icon: 'edit' as const,
    heading: msg`Apply`,
    body: msg`We review every application within 5 business days and send your link once you're approved.`,
    Visual: CreatorApplyStepVisual,
  },
  {
    icon: 'tag' as const,
    heading: msg`Share your link`,
    body: msg`Signups within 30 days of a click on your link are yours.`,
    Visual: CreatorLinkStepVisual,
  },
  {
    icon: 'users' as const,
    heading: msg`Earn 20% for 12 months`,
    body: msg`Of seat revenue on Cloud Organization and Enterprise plans, per customer, counted from their first payment.`,
    Visual: CommissionStepVisual,
  },
  {
    icon: 'check' as const,
    heading: msg`Get paid monthly`,
    body: msg`From $50, after a 30-day hold.`,
    Visual: CreatorPayoutStepVisual,
  },
];
