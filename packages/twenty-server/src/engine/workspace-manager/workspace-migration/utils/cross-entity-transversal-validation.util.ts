import { validateObjectMetadataCrossEntity } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-object-metadata-cross-entity.util';
import { validateViewFieldLabelIdentifierCrossEntity } from 'src/engine/metadata-modules/flat-view-field/validators/utils/validate-view-field-label-identifier-cross-entity.util';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const crossEntityTransversalValidation = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
  preDeletionFlatViewFieldMaps,
}: {
  optimisticUniversalFlatMaps: AllUniversalFlatEntityMaps;
  orchestratorActionsReport: OrchestratorActionsReport;
  preDeletionFlatViewFieldMaps: UniversalFlatEntityMaps<UniversalFlatViewField>;
}): Pick<OrchestratorFailureReport, 'objectMetadata' | 'viewField'> => {
  const { objectMetadata } = validateObjectMetadataCrossEntity({
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
  });

  const { viewField } = validateViewFieldLabelIdentifierCrossEntity({
    optimisticUniversalFlatMaps,
    deletedViewFieldActions: orchestratorActionsReport.viewField.delete,
    preDeletionFlatViewFieldMaps,
  });

  return { objectMetadata, viewField };
};
