import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export type AggregateOrchestratorActionsReportArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
  flatFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
};
