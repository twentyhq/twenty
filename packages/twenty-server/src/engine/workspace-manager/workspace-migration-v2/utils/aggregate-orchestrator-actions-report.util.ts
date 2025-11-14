import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-create-object-and-create-field-actions.util';
import { aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions } from 'src/engine/workspace-manager/workspace-migration-v2/utils/aggregate-orchestrator-actions-report-delete-object-and-delete-field.util';

type AggregateOrchestratorActionsReportArgs = {
  orchestratorActionsReport: OrchestratorActionsReport;
};
export const aggregateOrchestratorActionsReport = ({
  orchestratorActionsReport,
}: AggregateOrchestratorActionsReportArgs) => {
  const aggregatedOrchestratorActionsReport = [
    aggregateOrchestratorActionsReportCreateObjectAndCreateFieldActions,
    aggregateOrchestratorActionsReportDeleteObjectAndDeleteFieldActions,
  ].reduce(
    (currentOrchestratorActionsReport, aggregator) =>
      aggregator({
        orchestratorActionsReport: currentOrchestratorActionsReport,
      }),
    orchestratorActionsReport,
  );

  return { aggregatedOrchestratorActionsReport };
};
