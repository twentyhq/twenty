import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

type AggregatedActions = {
  createdFieldActionByObjectMetadataUniversalIdentifier: Record<
    string,
    UniversalCreateFieldAction
  >;
  createdObjectActionByObjectMetadataUniversalIdentifier: Record<
    string,
    UniversalCreateObjectAction
  >;
};

export const aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    const initialCreatedObjectActionByObjectMetadataUniversalIdentifier = (
      orchestratorActionsReport.objectMetadata
        .create as UniversalCreateObjectAction[]
    ).reduce(
      (acc, createObjectAction) => ({
        ...acc,
        [createObjectAction.flatEntity.universalIdentifier]: createObjectAction,
      }),
      {} as Record<string, UniversalCreateObjectAction>,
    );

    const initialAccumulator: AggregatedActions = {
      createdFieldActionByObjectMetadataUniversalIdentifier: {},
      createdObjectActionByObjectMetadataUniversalIdentifier:
        initialCreatedObjectActionByObjectMetadataUniversalIdentifier,
    };

    const {
      createdFieldActionByObjectMetadataUniversalIdentifier,
      createdObjectActionByObjectMetadataUniversalIdentifier,
    } = (
      orchestratorActionsReport.fieldMetadata
        .create as UniversalCreateFieldAction[]
    ).reduce<AggregatedActions>(
      (
        {
          createdObjectActionByObjectMetadataUniversalIdentifier,
          createdFieldActionByObjectMetadataUniversalIdentifier,
        },
        createFieldAction,
      ) => {
        const existingCreateObjectAction =
          createdObjectActionByObjectMetadataUniversalIdentifier[
            createFieldAction.objectMetadataUniversalIdentifier
          ];

        const existingCreateFieldAction =
          createdFieldActionByObjectMetadataUniversalIdentifier[
            createFieldAction.objectMetadataUniversalIdentifier
          ];

        const fieldAccumulator: {
          morphOrRelationUniversalFlatFieldMetadatas: UniversalFlatFieldMetadata[];
          otherUniversalFlatFieldMetadatas: UniversalFlatFieldMetadata[];
        } = {
          morphOrRelationUniversalFlatFieldMetadatas: [],
          otherUniversalFlatFieldMetadatas: [],
        };

        const {
          morphOrRelationUniversalFlatFieldMetadatas,
          otherUniversalFlatFieldMetadatas,
        } = createFieldAction.universalFlatFieldMetadatas.reduce(
          (acc, universalFlatFieldMetadata) => {
            if (
              isMorphOrRelationUniversalFlatFieldMetadata(
                universalFlatFieldMetadata,
              )
            ) {
              return {
                ...acc,
                morphOrRelationUniversalFlatFieldMetadatas: [
                  ...acc.morphOrRelationUniversalFlatFieldMetadatas,
                  universalFlatFieldMetadata,
                ],
              };
            }

            return {
              ...acc,
              otherUniversalFlatFieldMetadatas: [
                ...acc.otherUniversalFlatFieldMetadatas,
                universalFlatFieldMetadata,
              ],
            };
          },
          fieldAccumulator,
        );

        if (isDefined(existingCreateObjectAction)) {
          if (isDefined(existingCreateFieldAction)) {
            return {
              createdObjectActionByObjectMetadataUniversalIdentifier: {
                ...createdObjectActionByObjectMetadataUniversalIdentifier,
                [createFieldAction.objectMetadataUniversalIdentifier]: {
                  ...existingCreateObjectAction,
                  universalFlatFieldMetadatas: [
                    ...existingCreateObjectAction.universalFlatFieldMetadatas,
                    ...otherUniversalFlatFieldMetadatas,
                  ],
                },
              },
              createdFieldActionByObjectMetadataUniversalIdentifier: {
                ...createdFieldActionByObjectMetadataUniversalIdentifier,
                [createFieldAction.objectMetadataUniversalIdentifier]: {
                  ...existingCreateFieldAction,
                  universalFlatFieldMetadatas: [
                    ...existingCreateFieldAction.universalFlatFieldMetadatas,
                    ...morphOrRelationUniversalFlatFieldMetadatas,
                  ],
                },
              },
            };
          }

          if (morphOrRelationUniversalFlatFieldMetadatas.length > 0) {
            return {
              createdObjectActionByObjectMetadataUniversalIdentifier: {
                ...createdObjectActionByObjectMetadataUniversalIdentifier,
                [createFieldAction.objectMetadataUniversalIdentifier]: {
                  ...existingCreateObjectAction,
                  universalFlatFieldMetadatas: [
                    ...existingCreateObjectAction.universalFlatFieldMetadatas,
                    ...otherUniversalFlatFieldMetadatas,
                  ],
                },
              },
              createdFieldActionByObjectMetadataUniversalIdentifier: {
                ...createdFieldActionByObjectMetadataUniversalIdentifier,
                [createFieldAction.objectMetadataUniversalIdentifier]: {
                  ...createFieldAction,
                  universalFlatFieldMetadatas:
                    morphOrRelationUniversalFlatFieldMetadatas,
                },
              },
            };
          }

          return {
            createdObjectActionByObjectMetadataUniversalIdentifier: {
              ...createdObjectActionByObjectMetadataUniversalIdentifier,
              [createFieldAction.objectMetadataUniversalIdentifier]: {
                ...existingCreateObjectAction,
                universalFlatFieldMetadatas: [
                  ...existingCreateObjectAction.universalFlatFieldMetadatas,
                  ...otherUniversalFlatFieldMetadatas,
                ],
              },
            },
            createdFieldActionByObjectMetadataUniversalIdentifier,
          };
        }

        if (isDefined(existingCreateFieldAction)) {
          return {
            createdFieldActionByObjectMetadataUniversalIdentifier: {
              ...createdFieldActionByObjectMetadataUniversalIdentifier,
              [createFieldAction.objectMetadataUniversalIdentifier]: {
                ...existingCreateFieldAction,
                universalFlatFieldMetadatas: [
                  ...existingCreateFieldAction.universalFlatFieldMetadatas,
                  ...createFieldAction.universalFlatFieldMetadatas,
                ],
              },
            },
            createdObjectActionByObjectMetadataUniversalIdentifier,
          };
        }

        return {
          createdFieldActionByObjectMetadataUniversalIdentifier: {
            ...createdFieldActionByObjectMetadataUniversalIdentifier,
            [createFieldAction.objectMetadataUniversalIdentifier]:
              createFieldAction,
          },
          createdObjectActionByObjectMetadataUniversalIdentifier,
        };
      },
      initialAccumulator,
    );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        create: Object.values(
          createdFieldActionByObjectMetadataUniversalIdentifier,
        ),
      },
      objectMetadata: {
        ...orchestratorActionsReport.objectMetadata,
        create: Object.values(
          createdObjectActionByObjectMetadataUniversalIdentifier,
        ),
      },
    };
  };
