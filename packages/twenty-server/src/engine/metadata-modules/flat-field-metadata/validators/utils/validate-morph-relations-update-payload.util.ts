import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ValidateMorphRelationsUpdatePayloadArgs = {
  flatFieldMetadataToUpdate: FlatFieldMetadata;
  morphRelationsUpdatePayload: RelationUpdatePayload[];
  flatApplication: Pick<FlatApplication, 'universalIdentifier'>;
  isSystemBuild: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const validateMorphRelationsUpdatePayload = ({
  flatFieldMetadataToUpdate,
  morphRelationsUpdatePayload,
  flatApplication,
  isSystemBuild,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: ValidateMorphRelationsUpdatePayloadArgs): FlatFieldMetadataValidationError[] => {
  if (
    !isFlatFieldMetadataOfType(
      flatFieldMetadataToUpdate,
      FieldMetadataType.MORPH_RELATION,
    ) ||
    !isMorphRelationGroup(flatFieldMetadataToUpdate)
  ) {
    return [
      {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Destinations can only be added to a morph relation field, "${flatFieldMetadataToUpdate.name}" is not one`,
        userFriendlyMessage: msg`Destinations can only be added to a relation field that has several destinations`,
      },
    ];
  }

  // New destinations are owned by the caller. An application syncs only what it
  // owns, so a destination it does not own would block its later upgrades.
  if (
    !isSystemBuild &&
    flatFieldMetadataToUpdate.applicationUniversalIdentifier !==
      flatApplication.universalIdentifier
  ) {
    return [
      {
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: `Destinations of "${flatFieldMetadataToUpdate.name}" can only be added by the application that owns it`,
        userFriendlyMessage: msg`This field is managed by an application, so its destinations cannot be changed here`,
      },
    ];
  }

  const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: flatFieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const existingTargetObjectMetadataIds = new Set(
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: flatFieldMetadataToUpdate,
      flatFieldMetadataMaps,
      flatObjectMetadata: sourceFlatObjectMetadata,
    }).map(
      (targetFlatFieldMetadata) =>
        targetFlatFieldMetadata.relationTargetObjectMetadataId,
    ),
  );

  const requestedTargetObjectMetadataIds = new Set<string>();

  return morphRelationsUpdatePayload.flatMap(
    ({ targetObjectMetadataId }): FlatFieldMetadataValidationError[] => {
      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(targetFlatObjectMetadata)) {
        return [
          {
            code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
            message: `Destination object "${targetObjectMetadataId}" not found`,
            userFriendlyMessage: msg`Destination object not found`,
          },
        ];
      }

      if (requestedTargetObjectMetadataIds.has(targetObjectMetadataId)) {
        return [
          {
            code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
            message: `"${targetFlatObjectMetadata.nameSingular}" is listed more than once`,
            userFriendlyMessage: msg`The same destination cannot be added twice`,
          },
        ];
      }

      requestedTargetObjectMetadataIds.add(targetObjectMetadataId);

      if (targetFlatObjectMetadata.id === sourceFlatObjectMetadata.id) {
        return [
          {
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: `"${flatFieldMetadataToUpdate.name}" cannot have its own object "${sourceFlatObjectMetadata.nameSingular}" as a destination`,
            userFriendlyMessage: msg`A relation with several destinations cannot include its own object`,
          },
        ];
      }

      if (targetFlatObjectMetadata.isRemote) {
        return [
          {
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: `Remote object "${targetFlatObjectMetadata.nameSingular}" cannot be a destination`,
            userFriendlyMessage: msg`Remote objects cannot be relation destinations`,
          },
        ];
      }

      if (existingTargetObjectMetadataIds.has(targetObjectMetadataId)) {
        return [
          {
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: `"${targetFlatObjectMetadata.nameSingular}" is already a destination of "${flatFieldMetadataToUpdate.name}"`,
            userFriendlyMessage: msg`This object is already a destination of the field`,
          },
        ];
      }

      return [];
    },
  );
};
