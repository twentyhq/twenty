import { Injectable } from '@nestjs/common';

import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';

@Injectable()
export class ObjectTsVectorGinIndexOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectTsVectorGinIndexOnCreate',
    description:
      'When an object is created, generate the GIN index on its searchVector column that backs full-text search.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
        skipNameField: true,
      });

    const { indexes } = buildDefaultIndexesForCustomObject({
      flatObjectMetadata,
      defaultFlatFieldForCustomObjectMaps,
      objectFlatFieldMetadatas: Object.values(
        defaultFlatFieldForCustomObjectMaps.fields,
      ),
    });

    const tsVectorFlatIndex = indexes.tsVectorFlatIndex;

    // The GIN index is pure engine output with a deterministic isSystemSideEffect
    // universal identifier, so the engine merge dedups it silently if it is also
    // declared elsewhere; no local presence check is needed.
    return {
      status: 'success',
      operations: {
        index: {
          flatEntityToCreate: {
            [tsVectorFlatIndex.universalIdentifier]: tsVectorFlatIndex,
          },
        },
      },
    };
  }
}
