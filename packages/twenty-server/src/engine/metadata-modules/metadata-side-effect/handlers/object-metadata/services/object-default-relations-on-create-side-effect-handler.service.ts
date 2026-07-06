import { Injectable } from '@nestjs/common';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { isFlatEntityAlreadyPresentForSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/utils/is-flat-entity-already-present-for-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildDefaultRelationFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-relation-flat-field-metadatas-for-custom-object.util';

@Injectable()
export class ObjectDefaultRelationsOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectDefaultRelationsOnCreate',
    description:
      'When an object is created, generate the four default morph relation source fields (timelineActivities, attachments, noteTargets, taskTargets), their reverse fields on the standard objects, and the backing indexes.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    // The default relation builder only reads flatApplication.universalIdentifier;
    // the object's owner application identifier is authoritative here.
    const flatApplication = {
      universalIdentifier: flatObjectMetadata.applicationUniversalIdentifier,
    } as unknown as FlatApplication;

    const {
      standardSourceFlatFieldMetadatas,
      standardTargetFlatFieldMetadatas,
      standardTargetFlatIndexMetadatas,
    } = buildDefaultRelationFlatFieldMetadatasForCustomObject({
      existingFlatObjectMetadataMaps:
        relatedFlatEntityMaps.flatObjectMetadataMaps,
      sourceFlatObjectMetadata: flatObjectMetadata,
      flatApplication,
    });

    const fieldMetadataToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};

    for (const flatFieldMetadata of [
      ...standardSourceFlatFieldMetadatas,
      ...standardTargetFlatFieldMetadatas,
    ]) {
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

      fieldMetadataToCreate[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
    }

    const indexToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'index'>
    > = {};

    for (const flatIndexMetadata of standardTargetFlatIndexMetadatas) {
      if (
        isFlatEntityAlreadyPresentForSideEffect({
          metadataName: 'index',
          universalIdentifier: flatIndexMetadata.universalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
          relatedFlatEntityMaps,
        })
      ) {
        continue;
      }

      indexToCreate[flatIndexMetadata.universalIdentifier] = flatIndexMetadata;
    }

    if (
      Object.keys(fieldMetadataToCreate).length === 0 &&
      Object.keys(indexToCreate).length === 0
    ) {
      return { status: 'noop' };
    }

    const operations: MetadataSideEffectOperationsByMetadataName = {};

    if (Object.keys(fieldMetadataToCreate).length > 0) {
      operations.fieldMetadata = { flatEntityToCreate: fieldMetadataToCreate };
    }

    if (Object.keys(indexToCreate).length > 0) {
      operations.index = { flatEntityToCreate: indexToCreate };
    }

    return {
      status: 'success',
      operations,
    };
  }
}
