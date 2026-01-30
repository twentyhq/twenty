import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report-deprioritize-search-vector-update-field-actions.util';

export const aggregateOrchestratorActionsReport = ({
  orchestratorActionsReport,
  flatFieldMetadataMaps,
}: AggregateOrchestratorActionsReportArgs) => {
  const aggregatedOrchestratorActionsReport = [
    aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions,
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
