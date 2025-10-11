import { isDefined } from 'twenty-shared/utils';

import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

type AggregateOrchestratorActionsReportCreateObjectAndCreateFieldActionsArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
};

type AggregatedActions = {
  createdFieldActionByObjectMetadataId: Record<string, CreateFieldAction>;
  createdObjectActionByObjectMetadataId: Record<string, CreateObjectAction>;
};
export const aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportCreateObjectAndCreateFieldActionsArgs): OrchestratorActionsReport => {
    const initialCreatedObjectActionByObjectMetadataId = (
      orchestratorActionsReport.objectMetadata.created as CreateObjectAction[]
    ).reduce(
      (acc, createObjectAction) => ({
        ...acc,
        [createObjectAction.flatObjectMetadata.id]: createObjectAction,
      }),
      {},
    );
    const initialAccumulator: AggregatedActions = {
      createdFieldActionByObjectMetadataId: {},
      createdObjectActionByObjectMetadataId:
        initialCreatedObjectActionByObjectMetadataId,
    };

    const {
      createdFieldActionByObjectMetadataId,
      createdObjectActionByObjectMetadataId,
    } = (
      orchestratorActionsReport.fieldMetadata.created as CreateFieldAction[]
    ).reduce<AggregatedActions>(
      (
        {
          createdObjectActionByObjectMetadataId,
          createdFieldActionByObjectMetadataId,
        },
        createFieldAction,
      ) => {
        const existingCreateObjectAction =
          createdObjectActionByObjectMetadataId[
            createFieldAction.objectMetadataId
          ];

        if (isDefined(existingCreateObjectAction)) {
          return {
            createdObjectActionByObjectMetadataId: {
              ...createdObjectActionByObjectMetadataId,
              [createFieldAction.objectMetadataId]: {
                ...existingCreateObjectAction,
                flatFieldMetadatas: [
                  ...existingCreateObjectAction.flatFieldMetadatas,
                  ...createFieldAction.flatFieldMetadatas,
                ],
              },
            },
            createdFieldActionByObjectMetadataId,
          };
        }

        const existingCreateFieldAction =
          createdFieldActionByObjectMetadataId[
            createFieldAction.objectMetadataId
          ];

        if (isDefined(existingCreateFieldAction)) {
          return {
            createdFieldActionByObjectMetadataId: {
              ...createdFieldActionByObjectMetadataId,
              [createFieldAction.objectMetadataId]: {
                ...existingCreateFieldAction,
                flatFieldMetadatas: [
                  ...existingCreateFieldAction.flatFieldMetadatas,
                  ...createFieldAction.flatFieldMetadatas,
                ],
              },
            },
            createdObjectActionByObjectMetadataId,
          };
        }

        return {
          createdFieldActionByObjectMetadataId: {
            ...createdFieldActionByObjectMetadataId,
            [createFieldAction.objectMetadataId]: createFieldAction,
          },
          createdObjectActionByObjectMetadataId,
        };
      },
      initialAccumulator,
    );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        created: Object.values(createdFieldActionByObjectMetadataId),
      },
      objectMetadata: {
        ...orchestratorActionsReport.objectMetadata,
        created: Object.values(createdObjectActionByObjectMetadataId),
      },
    };
  };
