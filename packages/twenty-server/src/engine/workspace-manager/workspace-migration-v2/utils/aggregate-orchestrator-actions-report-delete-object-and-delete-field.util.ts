import { isDefined } from 'twenty-shared/utils';

import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type DeleteObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';

type AggregatedActions = {
  deleteFieldActionByFieldMetadataId: Record<string, DeleteFieldAction>;
};
export const aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    const deleteObjectActionByObjectMetadataId = (
      orchestratorActionsReport.objectMetadata.delete as DeleteObjectAction[]
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
      orchestratorActionsReport.fieldMetadata.delete as DeleteFieldAction[]
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
            [deleteFieldAction.entityId]: deleteFieldAction,
          },
        };
      },
      initialAccumulator,
    );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        delete: Object.values(deleteFieldActionByFieldMetadataId),
      },
    };
  };
