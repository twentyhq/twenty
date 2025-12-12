import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/types/workspace-migration-object-action-v2';

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
      {} as Record<string, CreateObjectAction>,
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

        const existingCreateFieldAction =
          createdFieldActionByObjectMetadataId[
            createFieldAction.objectMetadataId
          ];

        const initialAccumulator: {
          morphOrRelationFlatFieldMetadatas: FlatFieldMetadata[];
          otherFlatFieldMetadatas: FlatFieldMetadata[];
        } = {
          morphOrRelationFlatFieldMetadatas: [],
          otherFlatFieldMetadatas: [],
        };
        const { morphOrRelationFlatFieldMetadatas, otherFlatFieldMetadatas } =
          createFieldAction.flatFieldMetadatas.reduce(
            (acc, flatFieldMetadata) => {
              if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
                return {
                  ...acc,
                  morphOrRelationFlatFieldMetadatas: [
                    ...acc.morphOrRelationFlatFieldMetadatas,
                    flatFieldMetadata,
                  ],
                };
              }

              return {
                ...acc,
                otherFlatFieldMetadatas: [
                  ...acc.otherFlatFieldMetadatas,
                  flatFieldMetadata,
                ],
              };
            },
            initialAccumulator,
          );

        if (isDefined(existingCreateObjectAction)) {
          if (isDefined(existingCreateFieldAction)) {
            return {
              createdObjectActionByObjectMetadataId: {
                ...createdObjectActionByObjectMetadataId,
                [createFieldAction.objectMetadataId]: {
                  ...existingCreateObjectAction,
                  flatFieldMetadatas: [
                    ...existingCreateObjectAction.flatFieldMetadatas,
                    ...otherFlatFieldMetadatas,
                  ],
                },
              },
              createdFieldActionByObjectMetadataId: {
                ...createdFieldActionByObjectMetadataId,
                [createFieldAction.objectMetadataId]: {
                  ...existingCreateFieldAction,
                  flatFieldMetadatas: [
                    ...existingCreateFieldAction.flatFieldMetadatas,
                    ...morphOrRelationFlatFieldMetadatas,
                  ],
                },
              },
            };
          }

          if (morphOrRelationFlatFieldMetadatas.length > 0) {
            return {
              createdObjectActionByObjectMetadataId: {
                ...createdObjectActionByObjectMetadataId,
                [createFieldAction.objectMetadataId]: {
                  ...existingCreateObjectAction,
                  flatFieldMetadatas: [
                    ...existingCreateObjectAction.flatFieldMetadatas,
                    ...otherFlatFieldMetadatas,
                  ],
                },
              },
              createdFieldActionByObjectMetadataId: {
                ...createdFieldActionByObjectMetadataId,
                [createFieldAction.objectMetadataId]: {
                  ...createFieldAction,
                  flatFieldMetadatas: morphOrRelationFlatFieldMetadatas,
                },
              },
            };
          }

          return {
            createdObjectActionByObjectMetadataId: {
              ...createdObjectActionByObjectMetadataId,
              [createFieldAction.objectMetadataId]: {
                ...existingCreateObjectAction,
                flatFieldMetadatas: [
                  ...existingCreateObjectAction.flatFieldMetadatas,
                  ...otherFlatFieldMetadatas,
                ],
              },
            },
            createdFieldActionByObjectMetadataId,
          };
        }

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
