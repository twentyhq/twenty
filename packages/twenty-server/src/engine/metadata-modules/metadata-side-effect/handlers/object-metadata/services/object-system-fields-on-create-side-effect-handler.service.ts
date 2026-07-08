import { Injectable } from '@nestjs/common';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';

@Injectable()
export class ObjectSystemFieldsOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSystemFieldsOnCreate',
    description:
      'When an object is created, generate its 7 reserved system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position). The searchVector field is provisioned by the self-contained objectSearchVectorOnCreate handler alongside its GIN index and searchFieldMetadata. The default name field is NOT synthesized here: it is a caller-provided default field (SDK auto-complete on the manifest path, input transpiler on the API path).',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    // Only the reserved system fields are engine-owned. The name field is
    // caller-provided, so we always skip it here (skipNameField: true).
    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
        skipNameField: true,
      });

    // System fields are pure engine output: we always emit them. When a legacy
    // manifest also declares them they carry isSystemSideEffect too, so the
    // engine merge dedups the identical deterministic universal identifiers
    // silently (first-writer wins) rather than raising a collision.
    // The searchVector field is excluded here: it is owned by the self-contained
    // search-vector handler alongside its GIN index and searchFieldMetadata.
    const flatEntityToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};

    for (const [fieldName, flatFieldMetadata] of Object.entries(
      defaultFlatFieldForCustomObjectMaps.fields,
    )) {
      if (fieldName === 'searchVector') {
        continue;
      }

      flatEntityToCreate[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
    }

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToCreate,
        },
      },
    };
  }
}
