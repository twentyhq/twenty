import { validateObjectMetadataSystemFieldsIntegrity } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-object-metadata-system-fields-integrity';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

export const crossEntityTransversalValidation = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
}: {
  optimisticUniversalFlatMaps: AllUniversalFlatEntityMaps;
  orchestratorActionsReport: OrchestratorActionsReport;
}): Pick<OrchestratorFailureReport, 'objectMetadata'> => {
  const { objectMetadata } = validateObjectMetadataSystemFieldsIntegrity({
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
  });

  return { objectMetadata };
};
