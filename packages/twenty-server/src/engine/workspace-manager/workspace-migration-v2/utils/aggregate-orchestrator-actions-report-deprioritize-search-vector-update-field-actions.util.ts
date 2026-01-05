import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { isSearchVectorUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/utils/is-search-vector-update-field-action.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';

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
