import { msg } from '@lingui/core/macro';

import { ApplyStepVisual } from './integrator-step-visuals/ApplyStepVisual';
import { CommissionStepVisual } from './integrator-step-visuals/CommissionStepVisual';
import { PartnerCodeStepVisual } from './integrator-step-visuals/PartnerCodeStepVisual';

import { type ProgramStepperStep } from './ProgramStepper';

// The home stepper's form: a heading with its accent, one line under it.
export const INTEGRATOR_STEPPER_STEPS: readonly ProgramStepperStep[] = [
  {
    heading: msg`Apply to *the program*`,
    body: msg`Tell us about your company, your clients and what you've built with Twenty.`,
    Visual: ApplyStepVisual,
  },
  {
    heading: msg`Get your *partner code*`,
    body: msg`We review every application by hand, then send you your code.`,
    Visual: PartnerCodeStepVisual,
  },
  {
    heading: msg`Bring *your clients*`,
    body: msg`Earn 20% of seat revenue for 12 months on every Organization or Enterprise client.`,
    Visual: CommissionStepVisual,
  },
];
