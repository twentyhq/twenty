import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectSystemFieldsOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSystemFieldsOnCreate',
    description:
      'When an object is created, provision its 7 reserved system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position), all isSystemSideEffect so the engine owns their lifecycle; searchVector is handled by objectSearchVectorOnCreate and the name field is caller-provided. Their view fields are owned by the view handlers (objectIndexViewOnCreate, objectRecordPageOnCreate), which re-derive the same reserved fields statelessly from the object identity, so there is no ordering dependency between handlers. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own system fields.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;
    const { applicationUniversalIdentifier, universalIdentifier } =
      sourceFlatObjectMetadata;

    const systemFlatFieldMetadatas = Object.values(
      buildReservedSystemFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
      }),
    );

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: systemFlatFieldMetadatas,
            uniqueKey: 'universalIdentifier',
          }),
        },
      },
    };
  }
}
