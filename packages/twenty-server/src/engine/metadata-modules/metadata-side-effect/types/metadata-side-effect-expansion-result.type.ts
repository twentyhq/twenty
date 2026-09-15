import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

// Same contract as the builder (WorkspaceMigrationOrchestratorFailedResult):
// collisions and handler failures are merged into a single OrchestratorFailureReport
// so callers handle side-effect and builder failures through one uniform channel.
export type MetadataSideEffectExpansionResult =
  | {
      status: 'success';
      allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
    }
  | {
      status: 'fail';
      report: OrchestratorFailureReport;
    };
