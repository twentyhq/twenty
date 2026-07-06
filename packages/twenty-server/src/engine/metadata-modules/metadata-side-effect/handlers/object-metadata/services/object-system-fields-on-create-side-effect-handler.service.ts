import { Injectable } from '@nestjs/common';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { isFlatEntityAlreadyPresentForSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/utils/is-flat-entity-already-present-for-side-effect.util';
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
      'When an object is created, generate its 8 system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position, searchVector) and, when the object uses the derived name field as its label identifier, the default name field.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    const derivedNameFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: universalIdentifier,
      name: 'name',
    });

    // The default name field is synthesized only when it is the object's label
    // identifier. Junction objects (label identifier = id) and objects with an
    // author-declared label identifier skip it naturally.
    const skipNameField =
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier !==
      derivedNameFieldUniversalIdentifier;

    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
        skipNameField,
      });

    const flatEntityToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};

    for (const flatFieldMetadata of Object.values(
      defaultFlatFieldForCustomObjectMaps.fields,
    )) {
      if (
        isFlatEntityAlreadyPresentForSideEffect({
          metadataName: 'fieldMetadata',
          universalIdentifier: flatFieldMetadata.universalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
          relatedFlatEntityMaps,
        })
      ) {
        continue;
      }

      flatEntityToCreate[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
    }

    if (Object.keys(flatEntityToCreate).length === 0) {
      return { status: 'noop' };
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
