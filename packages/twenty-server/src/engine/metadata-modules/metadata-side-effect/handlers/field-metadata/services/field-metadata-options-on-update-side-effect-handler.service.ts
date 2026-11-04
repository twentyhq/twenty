import { Injectable } from '@nestjs/common';

import { buildFieldMetadataOptionSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-metadata-option-side-effect-result.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldMetadataOptionsOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldMetadataOptionsOnUpdate',
    description:
      "Keep a field's option rows in step with its options: create added options, update changed ones and delete removed ones, including when the field changes to or from an enum type.",
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    return buildFieldMetadataOptionSideEffectResult({
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
      targetUniversalFlatFieldMetadata: flatFieldMetadata,
      relatedFlatEntityMaps,
      context,
    });
  }
}
