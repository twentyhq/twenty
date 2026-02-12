import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type AggregateOrchestratorActionsReportArgs } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-aggregate-orchestrator-actions-report-args.type';
import { type OrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { mergeFieldIdByUniversalIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/merge-field-id-by-universal-identifier.util';
import { type UniversalCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type UniversalCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

export const aggregateNonRelationFieldsIntoObjectActions = ({
  orchestratorActionsReport,
}: AggregateOrchestratorActionsReportArgs): OrchestratorActionsReport => {
  const createObjectActions = orchestratorActionsReport.objectMetadata.create;
  const createFieldActions = orchestratorActionsReport.fieldMetadata.create;

  const createObjectActionByObjectUniversalIdentifier = new Map<
    string,
    UniversalCreateObjectAction
  >();

  for (const createObjectAction of createObjectActions) {
    createObjectActionByObjectUniversalIdentifier.set(
      createObjectAction.flatEntity.universalIdentifier,
      createObjectAction,
    );
  }

  const remainingCreateFieldActions: UniversalCreateFieldAction[] = [];

  for (const createFieldAction of createFieldActions) {
    const nonRelationFields: UniversalFlatFieldMetadata[] = [];
    const relationFields: UniversalFlatFieldMetadata[] = [];

    for (const field of createFieldAction.universalFlatFieldMetadatas) {
      if (isMorphOrRelationUniversalFlatFieldMetadata(field)) {
        relationFields.push(field);
      } else {
        nonRelationFields.push(field);
      }
    }

    const nonRelationFieldsByObjectUniversalIdentifier = new Map<
      string,
      UniversalFlatFieldMetadata[]
    >();

    for (const field of nonRelationFields) {
      const objectUniversalId = field.objectMetadataUniversalIdentifier;
      const existing =
        nonRelationFieldsByObjectUniversalIdentifier.get(objectUniversalId);

      if (isDefined(existing)) {
        existing.push(field);
      } else {
        nonRelationFieldsByObjectUniversalIdentifier.set(objectUniversalId, [
          field,
        ]);
      }
    }

    const unmergedNonRelationFields: UniversalFlatFieldMetadata[] = [];

    for (const [
      objectUniversalId,
      fields,
    ] of nonRelationFieldsByObjectUniversalIdentifier) {
      const matchingObjectAction =
        createObjectActionByObjectUniversalIdentifier.get(objectUniversalId);

      if (isDefined(matchingObjectAction)) {
        matchingObjectAction.universalFlatFieldMetadatas.push(...fields);
        matchingObjectAction.fieldIdByUniversalIdentifier =
          mergeFieldIdByUniversalIdentifier(
            matchingObjectAction.fieldIdByUniversalIdentifier,
            createFieldAction.fieldIdByUniversalIdentifier,
          );
      } else {
        unmergedNonRelationFields.push(...fields);
      }
    }

    const remainingFields = [...unmergedNonRelationFields, ...relationFields];

    if (remainingFields.length > 0) {
      remainingCreateFieldActions.push({
        ...createFieldAction,
        universalFlatFieldMetadatas: remainingFields,
      });
    }
  }

  return {
    ...orchestratorActionsReport,
    objectMetadata: {
      ...orchestratorActionsReport.objectMetadata,
      create: Array.from(
        createObjectActionByObjectUniversalIdentifier.values(),
      ),
    },
    fieldMetadata: {
      ...orchestratorActionsReport.fieldMetadata,
      create: remainingCreateFieldActions,
    },
  };
};
