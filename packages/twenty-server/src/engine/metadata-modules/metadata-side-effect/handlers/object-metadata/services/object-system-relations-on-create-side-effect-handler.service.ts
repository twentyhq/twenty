import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';
import { isNonEmptyArray } from '@sniptt/guards';

import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import {
  type MetadataSideEffectFailure,
  type MetadataSideEffectResult,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildSystemRelationFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type DefaultRelationStandardObjectNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

@Injectable()
export class ObjectSystemRelationsOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSystemRelationsOnCreate',
    description:
      'When an object is created, provision its default relations to the four standard relation objects (timelineActivity, attachment, noteTarget, taskTarget): the forward RELATION field on the new object, the reverse MORPH_RELATION field on the standard object (name-free deterministic identifier so an object rename is a lossless update), and the reverse join-column index. All emitted entities are isSystemSideEffect, so the engine owns their lifecycle. twenty-standard authors these fields itself and never reaches this handler (it syncs via the FromTo path). The handler always emits its bundles: a caller-provided field colliding on universal identifier hard-fails at merge time (RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER), and a caller field colliding on name hard-fails in the field validator (NOT_AVAILABLE).',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;

    const standardTargetFlatObjectMetadataByNameSingular = {} as Record<
      DefaultRelationStandardObjectNameSingular,
      UniversalFlatObjectMetadata
    >;

    const missingStandardObjectErrors: MetadataSideEffectFailure['errors'] = [];

    for (const standardObjectNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
      const standardTargetFlatObjectMetadata =
        relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[standardObjectNameSingular].universalIdentifier
        ];

      if (!isDefined(standardTargetFlatObjectMetadata)) {
        missingStandardObjectErrors.push({
          code: MetadataSideEffectExceptionCode.SIDE_EFFECT_PARENT_METADATA_NOT_FOUND,
          message: t`Could not resolve standard relation object "${standardObjectNameSingular}" to provision default relations`,
          userFriendlyMessage: msg`A standard object required to provision default relations could not be found`,
        });
        continue;
      }

      standardTargetFlatObjectMetadataByNameSingular[
        standardObjectNameSingular
      ] = standardTargetFlatObjectMetadata;
    }

    if (isNonEmptyArray(missingStandardObjectErrors)) {
      return {
        status: 'fail',
        type: 'create',
        metadataName: 'objectMetadata',
        flatEntityMinimalInformation: {
          universalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
          nameSingular: sourceFlatObjectMetadata.nameSingular,
        } as Partial<MetadataFlatEntity<'objectMetadata'>>,
        errors: missingStandardObjectErrors,
      };
    }

    const systemRelationBundles =
      buildSystemRelationFlatFieldMetadatasForObject({
        sourceFlatObjectMetadata,
        standardTargetFlatObjectMetadataByNameSingular,
        applicationUniversalIdentifier:
          sourceFlatObjectMetadata.applicationUniversalIdentifier,
      });

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: systemRelationBundles.flatMap(
              ({ forwardFlatFieldMetadata, reverseFlatFieldMetadata }) => [
                forwardFlatFieldMetadata,
                reverseFlatFieldMetadata,
              ],
            ),
            uniqueKey: 'universalIdentifier',
          }),
        },
        index: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: systemRelationBundles.map(
              ({ flatIndexMetadata }) => flatIndexMetadata,
            ),
            uniqueKey: 'universalIdentifier',
          }),
        },
      },
    };
  }
}
