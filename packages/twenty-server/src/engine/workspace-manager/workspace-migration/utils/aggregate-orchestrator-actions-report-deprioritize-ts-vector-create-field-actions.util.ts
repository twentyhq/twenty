import { FieldMetadataType } from 'twenty-shared/types';

import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export const aggregateOrchestratorActionsReportDeprioritizeTsVectorCreateFieldActions =
  ({
    orchestratorActionsReport,
  }: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
    const createFieldActions = orchestratorActionsReport.fieldMetadata.create;

    const tsVectorCreateFieldActions = createFieldActions.filter(
      (createFieldAction) =>
        createFieldAction.flatEntity.type === FieldMetadataType.TS_VECTOR,
    );

    if (tsVectorCreateFieldActions.length === 0) {
      return orchestratorActionsReport;
    }

    const otherCreateFieldActions = createFieldActions.filter(
      (createFieldAction) =>
        createFieldAction.flatEntity.type !== FieldMetadataType.TS_VECTOR,
    );

    return {
      ...orchestratorActionsReport,
      fieldMetadata: {
        ...orchestratorActionsReport.fieldMetadata,
        create: [...otherCreateFieldActions, ...tsVectorCreateFieldActions],
      },
    };
  };
