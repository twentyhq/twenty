import {
  PARTNER_APPLICATION_STEP_IDS,
  type PartnerApplicationStepId,
} from './data/partner-application-step-ids';
import { type PartnerApplicationState } from './partner-application-state';

export function getCurrentStepId(
  state: PartnerApplicationState,
): PartnerApplicationStepId {
  return PARTNER_APPLICATION_STEP_IDS[state.stepIndex];
}
