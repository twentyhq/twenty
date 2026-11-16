import { Injectable } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { isComputedField, isDefined } from 'twenty-shared/utils';

import { buildUniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-universal-computed-field-schema-reader.util';
import { renameComputedFieldComputationFields } from 'src/engine/metadata-modules/computed-field/utils/rename-computed-field-computation-fields.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

@Injectable()
export class FieldComputedFieldsOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldComputedFieldsOnUpdate',
    description:
      'Keep computed fields in step with a field they read, on any object: a rename rewrites the names used by their formula, rollup expression, rollup filter and rollup relation.',
  },
) {
  buildSideEffects({
    flatEntity: renamedFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const existingFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        renamedFlatFieldMetadata.universalIdentifier
      ];

    if (
      !isDefined(existingFlatFieldMetadata) ||
      existingFlatFieldMetadata.name === renamedFlatFieldMetadata.name
    ) {
      return { status: 'noop' };
    }

    const fieldOperations =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata;
    const { schemaReader, findObject } =
      buildUniversalComputedFieldSchemaReader({
        flatObjectMetadataMaps,
        flatFieldMetadataMapsList: [flatFieldMetadataMaps],
      });
    const fieldNameByUniversalIdentifier = new Map([
      [
        renamedFlatFieldMetadata.universalIdentifier,
        renamedFlatFieldMetadata.name,
      ],
    ]);

    const flatFieldMetadataToUpdate: Record<
      string,
      UniversalFlatFieldMetadata
    > = {};

    for (const existingComputedField of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      const object = isDefined(existingComputedField)
        ? findObject(existingComputedField.objectMetadataUniversalIdentifier)
        : undefined;

      if (
        !isDefined(existingComputedField) ||
        !isDefined(object) ||
        isDefined(
          fieldOperations?.flatEntityToDelete[
            existingComputedField.universalIdentifier
          ],
        )
      ) {
        continue;
      }

      const computedField: UniversalFlatFieldMetadata =
        fieldOperations?.flatEntityToUpdate[
          existingComputedField.universalIdentifier
        ] ?? existingComputedField;

      if (!isComputedField(computedField)) {
        continue;
      }

      const computation = renameComputedFieldComputationFields({
        computation: computedField.computation,
        object,
        schemaReader,
        fieldNameByUniversalIdentifier,
      });

      if (!isEqual(computation, computedField.computation)) {
        flatFieldMetadataToUpdate[computedField.universalIdentifier] = {
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
