import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';

const isSearchVectorUpdateFieldAction = ({
  updateFieldAction,
  flatFieldMetadataMaps,
}: {
  updateFieldAction: UpdateFieldAction;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: updateFieldAction.entityId,
  });

  return flatFieldMetadata?.name === SEARCH_VECTOR_FIELD.name;
};

export const aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions =
  ({
    orchestratorActionsReport,
    flatFieldMetadataMaps,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    assertIsDefinedOrThrow(flatFieldMetadataMaps);

    const updateFieldActions = orchestratorActionsReport.fieldMetadata
      .update as UpdateFieldAction[];

    const { searchVectorUpdateFieldActions, otherUpdateFieldActions } =
      updateFieldActions.reduce<{
        searchVectorUpdateFieldActions: UpdateFieldAction[];
        otherUpdateFieldActions: UpdateFieldAction[];
      }>(
        (acc, updateFieldAction) => {
          if (
            isSearchVectorUpdateFieldAction({
              updateFieldAction,
              flatFieldMetadataMaps,
            })
          ) {
            return {
              ...acc,
              searchVectorUpdateFieldActions: [
                ...acc.searchVectorUpdateFieldActions,
                updateFieldAction,
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

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        update: [...otherUpdateFieldActions, ...searchVectorUpdateFieldActions],
      },
    };
  };
