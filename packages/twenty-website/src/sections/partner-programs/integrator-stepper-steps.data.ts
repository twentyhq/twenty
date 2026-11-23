import { msg } from '@lingui/core/macro';

import { ApplyStepVisual } from './integrator-step-visuals/ApplyStepVisual';
import { CommissionStepVisual } from './integrator-step-visuals/CommissionStepVisual';
import { PartnerCodeStepVisual } from './integrator-step-visuals/PartnerCodeStepVisual';

// Shaped for ProductStepper's steps; sections may not import each other's types.
export const INTEGRATOR_STEPPER_STEPS = [
  {
    icon: 'edit' as const,
    heading: msg`Apply`,
    body: msg`Tell us about your company, the clients you work with and what you have built with Twenty. It takes a few minutes.`,
    Visual: ApplyStepVisual,
  },
  {
    icon: 'tag' as const,
    heading: msg`Get your partner code`,
    body: msg`We review every application by hand, then send you your partner code.`,
    Visual: PartnerCodeStepVisual,
  },
  {
    icon: 'users' as const,
    heading: msg`Bring your clients`,
    body: msg`Earn 20% of seat revenue for 12 months on every client on Organization or Enterprise.`,
    Visual: CommissionStepVisual,
  },
];
