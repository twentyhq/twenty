import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export type AggregateOrchestratorActionsReportArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
  flatFieldMetadataMaps?: MetadataFlatEntityMaps<'fieldMetadata'>;
};
