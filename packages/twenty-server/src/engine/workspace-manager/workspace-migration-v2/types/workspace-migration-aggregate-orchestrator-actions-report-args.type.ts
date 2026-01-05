import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

export type AggregateOrchestratorActionsReportArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
  flatFieldMetadataMaps?: FlatEntityMaps<FlatFieldMetadata>;
};
