import { Injectable } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { isComputedField, isDefined } from 'twenty-shared/utils';

import { findFlatComputedFieldsReadingField } from 'src/engine/metadata-modules/computed-field/utils/find-flat-computed-fields-reading-field.util';
import { renameComputedFieldComputationFields } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-fields.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeValidationRuleFieldChanges } from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rule-field-changes.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

@Injectable()
export class FieldComputedFieldsOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldComputedFieldsOnUpdate',
    description:
      'Keep computed fields in step with a field they read, on any object: a rename rewrites the names used by their formula, rollup expression, rollup filter and rollup relation, and the paths of their bindings.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: { flatFieldMetadataMaps },
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const fieldOperations =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata;
    const computeNewFieldNames = (
      updatedFields: UniversalFlatFieldMetadata[],
    ) =>
      computeValidationRuleFieldChanges({
        updatedFields,
        deletedFields: [],
        existingFieldByUniversalIdentifier:
          flatFieldMetadataMaps.byUniversalIdentifier,
      }).flatMap(({ fieldUniversalIdentifier, newFieldName }) =>
        isDefined(newFieldName)
          ? [[fieldUniversalIdentifier, newFieldName] as const]
          : [],
      );

    if (computeNewFieldNames([flatFieldMetadata]).length === 0) {
      return { status: 'noop' };
    }

    // Every rename of the migration at once: a later side effect on the same computed field would be dropped
    const fieldNameByUniversalIdentifier = new Map(
      computeNewFieldNames(
        Object.values(fieldOperations?.flatEntityToUpdate ?? {}).filter(
          isDefined,
        ),
      ),
    );

    const flatFieldMetadataToUpdate: Record<
      string,
      UniversalFlatFieldMetadata
    > = {};

    for (const existingComputedField of findFlatComputedFieldsReadingField({
      fieldUniversalIdentifiers: [...fieldNameByUniversalIdentifier.keys()],
      flatFieldMetadataMaps,
    })) {
      const { universalIdentifier } = existingComputedField;

      if (isDefined(fieldOperations?.flatEntityToDelete[universalIdentifier])) {
        continue;
      }

      const computedField: UniversalFlatFieldMetadata =
        fieldOperations?.flatEntityToUpdate[universalIdentifier] ??
        existingComputedField;

      if (!isComputedField(computedField)) {
        continue;
      }

      const computation = renameComputedFieldComputationFields({
        computation: computedField.computation,
        fieldNameByUniversalIdentifier,
      });

      if (!isEqual(computation, computedField.computation)) {
        flatFieldMetadataToUpdate[universalIdentifier] = {
          ...computedField,
          computation,
        };
      }
    }

    if (Object.keys(flatFieldMetadataToUpdate).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        fieldMetadata: { flatEntityToUpdate: flatFieldMetadataToUpdate },
      },
    };
  }
}
