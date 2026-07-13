import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
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
      'When an object is created, provision its default relations to the four standard relation objects (timelineActivity, attachment, noteTarget, taskTarget): the forward RELATION field on the new object, the reverse MORPH_RELATION field on the standard object (name-free deterministic identifier so an object rename is a lossless update), and the reverse join-column index. All emitted entities are isSystemSideEffect, so the engine owns their lifecycle. twenty-standard authors these fields itself and never reaches this handler (it syncs via the FromTo path). A caller-provided field with the same universal identifier (an override) is preserved: the colliding bundle is skipped.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;

    const standardTargetFlatObjectMetadataByNameSingular = {} as Record<
      DefaultRelationStandardObjectNameSingular,
      UniversalFlatObjectMetadata
    >;

    for (const flatObjectMetadataCandidate of Object.values(
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatObjectMetadataCandidate)) {
        continue;
      }

      if (
        DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.includes(
          flatObjectMetadataCandidate.nameSingular as DefaultRelationStandardObjectNameSingular,
        )
      ) {
        standardTargetFlatObjectMetadataByNameSingular[
          flatObjectMetadataCandidate.nameSingular as DefaultRelationStandardObjectNameSingular
        ] = flatObjectMetadataCandidate;
      }
    }

    const missingStandardObjectNameSingular =
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.find(
        (standardObjectNameSingular) =>
          !isDefined(
            standardTargetFlatObjectMetadataByNameSingular[
              standardObjectNameSingular
            ],
          ),
      );

    if (isDefined(missingStandardObjectNameSingular)) {
      return {
        status: 'fail',
        type: 'create',
        metadataName: 'objectMetadata',
        flatEntityMinimalInformation: {
          universalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
          nameSingular: sourceFlatObjectMetadata.nameSingular,
        } as Partial<MetadataFlatEntity<'objectMetadata'>>,
        errors: [
          {
            code: MetadataSideEffectExceptionCode.SIDE_EFFECT_PARENT_METADATA_NOT_FOUND,
            message: t`Could not resolve standard relation object "${missingStandardObjectNameSingular}" to provision default relations`,
            userFriendlyMessage: msg`A standard object required to provision default relations could not be found`,
          },
        ],
      };
    }

    const systemRelationBundles =
      buildSystemRelationFlatFieldMetadatasForObject({
        sourceFlatObjectMetadata,
        standardTargetFlatObjectMetadataByNameSingular,
        applicationUniversalIdentifier:
          sourceFlatObjectMetadata.applicationUniversalIdentifier,
      });

    const callerProvidedFieldUniversalIdentifiers = new Set<string>([
      ...Object.keys(
        allFlatEntityOperationRecordByMetadataName.fieldMetadata
          ?.flatEntityToCreate ?? {},
      ),
      ...Object.keys(
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      ),
    ]);

    const fieldMetadataToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};
    const indexToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'index'>
    > = {};

    for (const {
      forwardFlatFieldMetadata,
      reverseFlatFieldMetadata,
      flatIndexMetadata,
    } of systemRelationBundles) {
      const isOverriddenByCaller =
        callerProvidedFieldUniversalIdentifiers.has(
          forwardFlatFieldMetadata.universalIdentifier,
        ) ||
        callerProvidedFieldUniversalIdentifiers.has(
          reverseFlatFieldMetadata.universalIdentifier,
        );

      if (isOverriddenByCaller) {
        continue;
      }

      fieldMetadataToCreate[forwardFlatFieldMetadata.universalIdentifier] =
        forwardFlatFieldMetadata;
      fieldMetadataToCreate[reverseFlatFieldMetadata.universalIdentifier] =
        reverseFlatFieldMetadata;
      indexToCreate[flatIndexMetadata.universalIdentifier] = flatIndexMetadata;
    }

    if (Object.keys(fieldMetadataToCreate).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToCreate: fieldMetadataToCreate,
        },
        index: {
          flatEntityToCreate: indexToCreate,
        },
      },
    };
  }
}
