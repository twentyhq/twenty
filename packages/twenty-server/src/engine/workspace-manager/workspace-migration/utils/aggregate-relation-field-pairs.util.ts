import { isDefined } from 'twenty-shared/utils';

import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { mergeFieldIdByUniversalIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/merge-field-id-by-universal-identifier.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';

type FieldWithActionContext = {
  field: UniversalFlatFieldMetadata;
  fieldIdByUniversalIdentifier: Record<string, string> | undefined;
};

export const aggregateRelationFieldPairs = ({
  orchestratorActionsReport,
}: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
  const createFieldActions = orchestratorActionsReport.fieldMetadata.create;

  const fieldByUniversalIdentifier = new Map<string, FieldWithActionContext>();

  for (const action of createFieldActions) {
    for (const field of action.universalFlatFieldMetadatas) {
      fieldByUniversalIdentifier.set(field.universalIdentifier, {
        field,
        fieldIdByUniversalIdentifier: action.fieldIdByUniversalIdentifier,
      });
    }
  }

  const processedFieldUniversalIdentifiers = new Set<string>();
  const aggregatedCreateFieldActions: UniversalCreateFieldAction[] = [];

  for (const [
    universalIdentifier,
    fieldContext,
  ] of fieldByUniversalIdentifier) {
    if (processedFieldUniversalIdentifiers.has(universalIdentifier)) {
      continue;
    }

    const { field, fieldIdByUniversalIdentifier } = fieldContext;

    processedFieldUniversalIdentifiers.add(universalIdentifier);

    const fieldsToBundle: UniversalFlatFieldMetadata[] = [field];
    let mergedFieldIdMap = fieldIdByUniversalIdentifier;

    const targetUniversalIdentifier =
      field.relationTargetFieldMetadataUniversalIdentifier;

    if (isDefined(targetUniversalIdentifier)) {
      const targetFieldContext = fieldByUniversalIdentifier.get(
        targetUniversalIdentifier,
      );

      if (
        isDefined(targetFieldContext) &&
        !processedFieldUniversalIdentifiers.has(targetUniversalIdentifier)
      ) {
        fieldsToBundle.push(targetFieldContext.field);
        processedFieldUniversalIdentifiers.add(targetUniversalIdentifier);
        mergedFieldIdMap = mergeFieldIdByUniversalIdentifier(
          mergedFieldIdMap,
          targetFieldContext.fieldIdByUniversalIdentifier,
        );
      }
    }

    aggregatedCreateFieldActions.push({
      type: 'create',
      metadataName: 'fieldMetadata',
      universalFlatFieldMetadatas: fieldsToBundle,
      fieldIdByUniversalIdentifier: mergedFieldIdMap,
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
