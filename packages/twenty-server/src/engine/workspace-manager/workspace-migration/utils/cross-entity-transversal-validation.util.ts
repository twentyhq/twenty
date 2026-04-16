import { validateObjectMetadataCrossEntity } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-object-metadata-cross-entity.util';
import { validateViewFieldLabelIdentifierCrossEntity } from 'src/engine/metadata-modules/flat-view-field/validators/utils/validate-view-field-label-identifier-cross-entity.util';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { validateUniversalIdentifierCrossEntityUniquenessThroughReportMutation } from 'src/engine/workspace-manager/workspace-migration/utils/validate-universal-identifier-cross-entity-uniqueness-through-report-mutation.util';

export const crossEntityTransversalValidation = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
  preDeletionFlatViewFieldMaps,
}: {
  optimisticUniversalFlatMaps: AllUniversalFlatEntityMaps;
  orchestratorActionsReport: OrchestratorActionsReport;
  preDeletionFlatViewFieldMaps: UniversalFlatEntityMaps<UniversalFlatViewField>;
}): OrchestratorFailureReport => {
  const crossEntityFailureReport = EMPTY_ORCHESTRATOR_FAILURE_REPORT();

  const { objectMetadata } = validateObjectMetadataCrossEntity({
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
  });

  const { viewField } = validateViewFieldLabelIdentifierCrossEntity({
    optimisticUniversalFlatMaps,
    deletedViewFieldActions: orchestratorActionsReport.viewField.delete,
    preDeletionFlatViewFieldMaps,
  });

  crossEntityFailureReport.objectMetadata.push(...objectMetadata);
  crossEntityFailureReport.viewField.push(...viewField);

  validateUniversalIdentifierCrossEntityUniquenessThroughReportMutation({
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
    orchestratorFailureReport: crossEntityFailureReport,
  });

  return crossEntityFailureReport;
};
