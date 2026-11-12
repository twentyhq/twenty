/* @license Enterprise */

import { type AccessGroupPropagationPlan } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-plan.type';

export type ApplyAccessGroupPropagationPlanJobData = {
  workspaceId: string;
  plan: AccessGroupPropagationPlan;
  computedRecordCount: number;
};
