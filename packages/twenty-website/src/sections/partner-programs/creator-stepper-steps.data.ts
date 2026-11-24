import { msg } from '@lingui/core/macro';

import { CreatorApplyStepVisual } from './creator-step-visuals/CreatorApplyStepVisual';
import { CreatorLinkStepVisual } from './creator-step-visuals/CreatorLinkStepVisual';
import { CreatorPayoutStepVisual } from './creator-step-visuals/CreatorPayoutStepVisual';
import { CommissionStepVisual } from './integrator-step-visuals/CommissionStepVisual';

import { type ProgramStepperStep } from './ProgramStepper';

// The home stepper's form: a heading with its accent, one line under it.
export const CREATOR_STEPPER_STEPS: readonly ProgramStepperStep[] = [
  {
    heading: msg`Apply to *the program*`,
    body: msg`We review every application within 5 business days, then send your link.`,
    Visual: CreatorApplyStepVisual,
  },
  {
    heading: msg`Share *your link*`,
    body: msg`Every signup within 30 days of a click on it is yours.`,
    Visual: CreatorLinkStepVisual,
  },
  {
    heading: msg`Earn 20% *for 12 months*`,
    body: msg`On seat revenue from Cloud Organization and Enterprise plans, per customer.`,
    Visual: CommissionStepVisual,
  },
  {
    heading: msg`Get paid *every month*`,
    body: msg`From $50, after a 30-day hold.`,
    Visual: CreatorPayoutStepVisual,
  },
];
