import { isDefined } from 'twenty-shared/utils';

import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';

type AggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActionsArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
};

type AggregatedActions = {
  deleteFieldActionByFieldMetadataId: Record<string, DeleteFieldAction>;
};
export const aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActionsArgs): OrchestratorActionsReport => {
    const deleteObjectActionByObjectMetadataId = (
      orchestratorActionsReport.objectMetadata.deleted as DeleteObjectAction[]
    ).reduce<Record<string, DeleteObjectAction>>(
      (acc, deleteObjectAction) => ({
        ...acc,
        [deleteObjectAction.entityId]: deleteObjectAction,
      }),
      {},
    );
    const initialAccumulator: AggregatedActions = {
      deleteFieldActionByFieldMetadataId: {},
    };

    const { deleteFieldActionByFieldMetadataId } = (
      orchestratorActionsReport.fieldMetadata.deleted as DeleteFieldAction[]
    ).reduce<AggregatedActions>(
      ({ deleteFieldActionByFieldMetadataId }, deleteFieldAction) => {
        const fieldParentObjectDeleteObjectAction =
          deleteObjectActionByObjectMetadataId[
            deleteFieldAction.objectMetadataId
          ];

        if (isDefined(fieldParentObjectDeleteObjectAction)) {
          return {
            deleteFieldActionByFieldMetadataId,
          };
        }

        return {
          deleteFieldActionByFieldMetadataId: {
            ...deleteFieldActionByFieldMetadataId,
            [deleteFieldAction.fieldMetadataId]: deleteFieldAction,
          },
        };
      },
      initialAccumulator,
    );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        deleted: Object.values(deleteFieldActionByFieldMetadataId),
      },
    };
  };
