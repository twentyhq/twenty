import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { computeFormulaFieldUpdatesAfterFieldRename } from 'src/engine/metadata-modules/formula-field/utils/compute-formula-field-updates-after-field-rename.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldFormulasOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldFormulasOnUpdate',
    description:
      'Keep formula fields in step with a field they read, on any object: a rename rewrites the formula expressions to the new name.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const existingFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.universalIdentifier
      ];

    if (
      !isDefined(existingFlatFieldMetadata) ||
      existingFlatFieldMetadata.name === flatFieldMetadata.name
    ) {
      return { status: 'noop' };
    }

    const fieldOperations =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata;
    const flatFieldMetadataToUpdate =
      computeFormulaFieldUpdatesAfterFieldRename({
        renamedFieldUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        previousFieldName: existingFlatFieldMetadata.name,
        newFieldName: flatFieldMetadata.name,
        existingUniversalFlatFieldMetadataByUniversalIdentifier:
          relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
        pendingUniversalFlatFieldMetadataUpdateByUniversalIdentifier:
          fieldOperations?.flatEntityToUpdate ?? {},
        deletedUniversalFlatFieldMetadataByUniversalIdentifier:
          fieldOperations?.flatEntityToDelete ?? {},
      });

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
