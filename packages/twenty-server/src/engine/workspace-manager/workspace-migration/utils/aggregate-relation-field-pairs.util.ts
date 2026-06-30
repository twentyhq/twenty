import { isDefined } from 'twenty-shared/utils';

import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';

export const aggregateRelationFieldPairs = ({
  orchestratorActionsReport,
}: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
  const createFieldActions = orchestratorActionsReport.fieldMetadata.create;

  const actionByFieldUniversalIdentifier = new Map<
    string,
    UniversalCreateFieldAction
  >();

  for (const action of createFieldActions) {
    actionByFieldUniversalIdentifier.set(
      action.flatEntity.universalIdentifier,
      action,
    );
  }

  const processedFieldUniversalIdentifiers = new Set<string>();
  const aggregatedCreateFieldActions: UniversalCreateFieldAction[] = [];

  for (const [
    universalIdentifier,
    action,
  ] of actionByFieldUniversalIdentifier) {
    if (processedFieldUniversalIdentifiers.has(universalIdentifier)) {
      continue;
    }

    processedFieldUniversalIdentifiers.add(universalIdentifier);

    const targetUniversalIdentifier =
      action.flatEntity.relationTargetFieldMetadataUniversalIdentifier;

    if (!isDefined(targetUniversalIdentifier)) {
      aggregatedCreateFieldActions.push(action);
      continue;
    }

    const targetAction = actionByFieldUniversalIdentifier.get(
      targetUniversalIdentifier,
    );

    if (
      !isDefined(targetAction) ||
      processedFieldUniversalIdentifiers.has(targetUniversalIdentifier)
    ) {
      aggregatedCreateFieldActions.push(action);
      continue;
    }

    processedFieldUniversalIdentifiers.add(targetUniversalIdentifier);

    aggregatedCreateFieldActions.push({
      type: 'create',
      metadataName: 'fieldMetadata',
      flatEntity: action.flatEntity,
      id: action.id,
      relatedUniversalFlatFieldMetadata: targetAction.flatEntity,
      relatedFieldId: targetAction.id,
    });
  }

  return {
    ...orchestratorActionsReport,
    fieldMetadata: {
      ...orchestratorActionsReport.fieldMetadata,
      create: aggregatedCreateFieldActions,
    },
  };
};
