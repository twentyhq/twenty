import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

export const aggregateNonRelationFieldsIntoObjectActions = ({
  orchestratorActionsReport,
}: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
  const createObjectActions = orchestratorActionsReport.objectMetadata.create;
  const createFieldActions = orchestratorActionsReport.fieldMetadata.create;

  const createObjectActionByObjectUniversalIdentifier = new Map<
    string,
    UniversalCreateObjectAction
  >();

  for (const createObjectAction of createObjectActions) {
    createObjectActionByObjectUniversalIdentifier.set(
      createObjectAction.flatEntity.universalIdentifier,
      createObjectAction,
    );
  }

  const remainingCreateFieldActions: UniversalCreateFieldAction[] = [];

  for (const createFieldAction of createFieldActions) {
    const flatFieldMetadata = createFieldAction.flatEntity;

    if (isMorphOrRelationFieldMetadataType(flatFieldMetadata.type)) {
      remainingCreateFieldActions.push(createFieldAction);
      continue;
    }

    const objectUniversalId =
      flatFieldMetadata.objectMetadataUniversalIdentifier;
    const matchingObjectAction =
      createObjectActionByObjectUniversalIdentifier.get(objectUniversalId);

    if (isDefined(matchingObjectAction)) {
      matchingObjectAction.universalFlatFieldMetadatas.push(flatFieldMetadata);

      if (isDefined(createFieldAction.id)) {
        matchingObjectAction.fieldIdByUniversalIdentifier = {
          ...matchingObjectAction.fieldIdByUniversalIdentifier,
          [flatFieldMetadata.universalIdentifier]: createFieldAction.id,
        };
      }
    } else {
      remainingCreateFieldActions.push(createFieldAction);
    }
  }

  return {
    ...orchestratorActionsReport,
    objectMetadata: {
      ...orchestratorActionsReport.objectMetadata,
      create: Array.from(
        createObjectActionByObjectUniversalIdentifier.values(),
      ),
    },
    fieldMetadata: {
      ...orchestratorActionsReport.fieldMetadata,
      create: remainingCreateFieldActions,
    },
  };
};
