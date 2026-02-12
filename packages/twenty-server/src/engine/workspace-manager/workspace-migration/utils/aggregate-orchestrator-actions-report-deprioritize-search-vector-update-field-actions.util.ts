import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';

export const aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions =
  ({
    orchestratorActionsReport,
    flatFieldMetadataMaps,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    assertIsDefinedOrThrow(flatFieldMetadataMaps);

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
