/* @license Enterprise */

import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export type AccessGroupComputePlanStep =
  DeferredWorkspaceOperationPayload<'compute_recordAccessGroupIds'>['objectComputes'][number];
