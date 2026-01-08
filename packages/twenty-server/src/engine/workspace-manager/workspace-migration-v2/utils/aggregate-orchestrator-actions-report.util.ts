import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-delete-object-and-delete-field.util';
import { aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-deprioritize-search-vector-update-field-actions.util';

export const aggregateOrchestratorActionsReport = ({
  orchestratorActionsReport,
  flatFieldMetadataMaps,
}: AggregateOrchestratorActionsReportArgs) => {
  const aggregatedOrchestratorActionsReport = [
    aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions,
    aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions,
    aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions,
  ].reduce(
    (currentOrchestratorActionsReport, aggregator) =>
      aggregator({
        orchestratorActionsReport: currentOrchestratorActionsReport,
        flatFieldMetadataMaps,
      }),
    orchestratorActionsReport,
  );

  return { aggregatedOrchestratorActionsReport };
};
