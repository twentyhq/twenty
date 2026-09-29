import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export const validateWorkflowVersionRecordFields = ({
  steps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  steps: WorkflowAction[];
} & Pick<
  MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'workflowVersion'>,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): string[] => {
  const errors: string[] = [];
  const fieldNamesByObjectName = new Map<string, Set<string>>();
  const fieldNamesByObjectIdentifier = new Map<string, Set<string>>();
  for (const object of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const fieldNames = new Set<string>();
    fieldNamesByObjectName.set(object.nameSingular, fieldNames);
    fieldNamesByObjectIdentifier.set(object.universalIdentifier, fieldNames);
  }
  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const fieldNames = fieldNamesByObjectIdentifier.get(
      field.objectMetadataUniversalIdentifier,
    );
    if (!isDefined(fieldNames)) {
      continue;
    }
    fieldNames.add(field.name);
    if (
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION) &&
      isDefined(field.universalSettings) &&
      'relationType' in field.universalSettings &&
      field.universalSettings.relationType === RelationType.MANY_TO_ONE
    ) {
      fieldNames.add(
        computeMorphOrRelationFieldJoinColumnName({ name: field.name }),
      );
      const target = isDefined(
        field.relationTargetObjectMetadataUniversalIdentifier,
      )
        ? flatObjectMetadataMaps.byUniversalIdentifier[
            field.relationTargetObjectMetadataUniversalIdentifier
          ]
        : undefined;
      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(target)
      ) {
        fieldNames.add(
          getMorphNameFromMorphFieldMetadataName({
            morphRelationFlatFieldMetadata: {
              name: field.name,
              universalSettings: { relationType: RelationType.MANY_TO_ONE },
            },
            nameSingular: target.nameSingular,
            namePlural: target.namePlural ?? target.nameSingular,
          }),
        );
      }
    }
  }

  for (const step of steps) {
    if (
      step.type !== 'CREATE_RECORD' &&
      step.type !== 'UPDATE_RECORD' &&
      step.type !== 'UPSERT_RECORD'
    ) {
      continue;
    }
    const fieldNames = fieldNamesByObjectName.get(
      step.settings.input.objectName,
    );
    if (!isDefined(fieldNames)) {
      errors.push(
        `Workflow step ${step.name}: unknown object ${step.settings.input.objectName}`,
      );
      continue;
    }
    for (const name of Object.keys(step.settings.input.objectRecord)) {
      if (!fieldNames.has(name)) {
        errors.push(`Workflow step ${step.name}: unknown record field ${name}`);
      }
    }

    if (
      step.type === 'UPDATE_RECORD' &&
      (!isDefined(step.settings.input.fieldsToUpdate) ||
        step.settings.input.fieldsToUpdate.length === 0 ||
        step.settings.input.fieldsToUpdate.some(
          (name) =>
            !fieldNames.has(name) ||
            !Object.prototype.hasOwnProperty.call(
              step.settings.input.objectRecord,
              name,
            ),
        ))
    ) {
      errors.push(
        `Workflow step ${step.name}: fieldsToUpdate must select existing fields with values in objectRecord`,
      );
    }
  }
  return errors;
};
