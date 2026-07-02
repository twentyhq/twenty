import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';

export const aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions =
  ({
    orchestratorActionsReport,
    flatFieldMetadataMaps,
    searchVectorUniversalIdentifiersToRebuild,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    assertIsDefinedOrThrow(flatFieldMetadataMaps);

    const rebuildTargetUniversalIdentifiers =
      searchVectorUniversalIdentifiersToRebuild ?? new Set<string>();

    const coveredVectorUniversalIdentifiers = new Set<string>();

    const updateFieldActions = orchestratorActionsReport.fieldMetadata.update;

    const { searchVectorUpdateFieldActions, otherUpdateFieldActions } =
      updateFieldActions.reduce<{
        searchVectorUpdateFieldActions: UniversalUpdateFieldAction[];
        otherUpdateFieldActions: UniversalUpdateFieldAction[];
      }>(
        (acc, updateFieldAction) => {
          const flatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier: updateFieldAction.universalIdentifier,
          });

          const isSearchVectorUpdateFieldAction =
            flatFieldMetadata.name === SEARCH_VECTOR_FIELD.name;

          if (isSearchVectorUpdateFieldAction) {
            coveredVectorUniversalIdentifiers.add(
              updateFieldAction.universalIdentifier,
            );

            const searchVectorUpdateFieldAction =
              rebuildTargetUniversalIdentifiers.has(
                updateFieldAction.universalIdentifier,
              )
                ? { ...updateFieldAction, rebuildSearchVector: true }
                : updateFieldAction;

            return {
              ...acc,
              searchVectorUpdateFieldActions: [
                ...acc.searchVectorUpdateFieldActions,
                searchVectorUpdateFieldAction,
              ],
            };
          }

          return {
            ...acc,
            otherUpdateFieldActions: [
              ...acc.otherUpdateFieldActions,
              updateFieldAction,
            ],
          };
        },
        {
          searchVectorUpdateFieldActions: [],
          otherUpdateFieldActions: [],
        },
      );

    const synthesizedSearchVectorUpdateFieldActions: UniversalUpdateFieldAction[] =
      [...rebuildTargetUniversalIdentifiers].flatMap(
        (vectorUniversalIdentifier) =>
          coveredVectorUniversalIdentifiers.has(vectorUniversalIdentifier)
            ? []
            : [
                {
                  type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
                  metadataName: 'fieldMetadata',
                  universalIdentifier: vectorUniversalIdentifier,
                  update: {},
                  rebuildSearchVector: true,
                },
              ],
      );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        update: [
          ...otherUpdateFieldActions,
          ...searchVectorUpdateFieldActions,
          ...synthesizedSearchVectorUpdateFieldActions,
        ],
      },
    };
  };
