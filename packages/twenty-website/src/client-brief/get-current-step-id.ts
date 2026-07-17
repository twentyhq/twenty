import {
  CLIENT_BRIEF_STEP_IDS,
  type ClientBriefStepId,
} from './data/client-brief-step-ids';
import { type ClientBriefState } from './client-brief-state';

export function getCurrentStepId(state: ClientBriefState): ClientBriefStepId {
  return CLIENT_BRIEF_STEP_IDS[state.stepIndex];
}
