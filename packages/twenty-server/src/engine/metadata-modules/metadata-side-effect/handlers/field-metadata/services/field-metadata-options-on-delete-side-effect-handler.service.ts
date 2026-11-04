import { Injectable } from '@nestjs/common';

import { buildFieldMetadataOptionSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-metadata-option-side-effect-result.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldMetadataOptionsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldMetadataOptionsOnDelete',
    description: 'When a field is deleted, delete its option rows.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    return buildFieldMetadataOptionSideEffectResult({
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
      targetUniversalFlatFieldMetadata: undefined,
      relatedFlatEntityMaps,
      context,
    });
  }
}
