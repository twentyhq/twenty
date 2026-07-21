import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

// A single failure emitted by a side-effect handler, using the exact same shape
// as the builder's per-entity validation failure (a `status: 'fail'` tag spread
// over a FailedFlatEntityValidation), so both sources merge into one report.
export type MetadataSideEffectFailure = {
  status: 'fail';
} & FailedFlatEntityValidation<AllMetadataName, WorkspaceMigrationActionType>;

// Discriminated union of the three handler outcomes: `noop` when there is
// nothing to do, `success` when it produced companion operations to merge, or
// `fail` (fail-slow) with a validation failure the engine aggregates instead of
// throwing. `success` therefore always carries operations, keeping the empty
// case explicit as `noop` rather than a success with `operations: {}`.
export type MetadataSideEffectResult =
  | {
      status: 'noop';
    }
  | {
      status: 'success';
      operations: MetadataSideEffectOperationsByMetadataName;
    }
  | MetadataSideEffectFailure;
