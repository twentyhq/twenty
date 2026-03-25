import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { aggregateNonRelationFieldsIntoObjectActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-non-relation-fields-into-object-actions.util';
import { aggregateOrchestratorActionsReportDeprioritizeSearchVectorUpdateFieldActions } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-orchestrator-actions-report-deprioritize-search-vector-update-field-actions.util';
import { aggregateRelationFieldPairs } from 'src/engine/workspace-manager/workspace-migration/utils/aggregate-relation-field-pairs.util';

export const aggregateOrchestratorActionsReport = ({
  orchestratorActionsReport,
  flatFieldMetadataMaps,
}: AggregateOrchestratorActionsReportArgs) => {
  const aggregatedOrchestratorActionsReport = [
    aggregateNonRelationFieldsIntoObjectActions,
    aggregateRelationFieldPairs,
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
