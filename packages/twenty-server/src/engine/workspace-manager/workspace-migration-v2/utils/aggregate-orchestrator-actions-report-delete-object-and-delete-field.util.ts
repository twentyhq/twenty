import { OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { isDefined } from 'twenty-shared/utils';

type AggregateOrchestratorActionsReportCreateObjectAndCreateFieldActionsArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
};
type AggregatedActions = {
  deleteFieldActionByFieldMetadataId: Record<string, DeleteFieldAction>;
};
export const aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportCreateObjectAndCreateFieldActionsArgs): OrchestratorActionsReport => {
    const deleteObjectActionByObjectMetadataId = (
      orchestratorActionsReport.objectMetadata.deleted as DeleteObjectAction[]
    ).reduce<Record<string, DeleteObjectAction>>(
      (acc, deleteObjectAction) => ({
        ...acc,
        [deleteObjectAction.objectMetadataId]: deleteObjectAction,
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
            deleteObjectActionByObjectMetadataId,
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
