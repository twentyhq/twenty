/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { RelatedRecordPathExceptionCode } from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';
import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';
import { type UniversalFlatRelatedRecordPath } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-related-record-path.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type RelatedRecordPathRelatedMaps = Pick<
  UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'],
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatRelatedRecordPathMaps'
>;

const buildInvalidInputError = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatEntityValidationError,
  'message' | 'userFriendlyMessage'
>): FlatEntityValidationError => ({
  code: RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT,
  message,
  userFriendlyMessage,
});

const buildNotFoundError = (): FlatEntityValidationError => ({
  code: RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND,
  message: t`Related record path not found`,
  userFriendlyMessage: msg`Related record path not found`,
});

@Injectable()
export class FlatRelatedRecordPathValidatorService {
  private collectPathErrors({
    universalFlatRelatedRecordPath,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRelatedRecordPathMaps,
    },
  }: {
    universalFlatRelatedRecordPath: UniversalFlatRelatedRecordPath;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: RelatedRecordPathRelatedMaps;
  }): FlatEntityValidationError[] {
    const {
      sourceObjectMetadataUniversalIdentifier,
      targetObjectMetadataUniversalIdentifier,
      thirdFieldMetadataUniversalIdentifier,
      secondFieldMetadataUniversalIdentifier,
    } = universalFlatRelatedRecordPath;

    const sourceFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: sourceObjectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(sourceFlatObjectMetadata)) {
      return [
        buildInvalidInputError({
          message: t`Related record path source object not found`,
          userFriendlyMessage: msg`Related record path source object not found`,
        }),
      ];
    }

    const targetFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: targetObjectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      return [
        buildInvalidInputError({
          message: t`Related record path target object not found`,
          userFriendlyMessage: msg`Related record path target object not found`,
        }),
      ];
    }

    if (
      isDefined(thirdFieldMetadataUniversalIdentifier) &&
      !isDefined(secondFieldMetadataUniversalIdentifier)
    ) {
      return [
        buildInvalidInputError({
          message: t`Related record path cannot skip its second relation`,
          userFriendlyMessage: msg`Related record path cannot skip its second relation`,
        }),
      ];
    }

    const fieldMetadataUniversalIdentifiers =
      getRelatedRecordPathFieldMetadataUniversalIdentifiers(
        universalFlatRelatedRecordPath,
      );

    const visitedObjectMetadataUniversalIdentifiers = new Set([
      sourceObjectMetadataUniversalIdentifier,
    ]);
    let currentObjectMetadataUniversalIdentifier =
      sourceObjectMetadataUniversalIdentifier;

    for (const fieldMetadataUniversalIdentifier of fieldMetadataUniversalIdentifiers) {
      const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.objectMetadataUniversalIdentifier !==
          currentObjectMetadataUniversalIdentifier
      ) {
        return [
          buildInvalidInputError({
            message: t`Each related record path field must belong to the object reached by the previous relation`,
            userFriendlyMessage: msg`Each related record path field must belong to the object reached by the previous relation`,
          }),
        ];
      }

      if (
        !isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata) ||
        isMorphRelationHead(flatFieldMetadata) ||
        !isDefined(
          flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        )
      ) {
        return [
          buildInvalidInputError({
            message: t`Related record path fields must be relations`,
            userFriendlyMessage: msg`Related record path fields must be relations`,
          }),
        ];
      }

      if (!flatFieldMetadata.isActive) {
        return [
          buildInvalidInputError({
            message: t`Related record path fields must be active`,
            userFriendlyMessage: msg`Related record path fields must be active`,
          }),
        ];
      }

      const nextObjectMetadataUniversalIdentifier =
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier;

      if (
        visitedObjectMetadataUniversalIdentifiers.has(
          nextObjectMetadataUniversalIdentifier,
        )
      ) {
        return [
          buildInvalidInputError({
            message: t`Related record path cannot visit the same object twice`,
            userFriendlyMessage: msg`Related record path cannot visit the same object twice`,
          }),
        ];
      }

      visitedObjectMetadataUniversalIdentifiers.add(
        nextObjectMetadataUniversalIdentifier,
      );
      currentObjectMetadataUniversalIdentifier =
        nextObjectMetadataUniversalIdentifier;
    }

    if (
      currentObjectMetadataUniversalIdentifier !==
      targetObjectMetadataUniversalIdentifier
    ) {
      return [
        buildInvalidInputError({
          message: t`Related record path must end on its target object`,
          userFriendlyMessage: msg`Related record path must end on its target object`,
        }),
      ];
    }

    const hasDuplicatePath = Object.values(
      flatRelatedRecordPathMaps.byUniversalIdentifier,
    ).some(
      (otherFlatRelatedRecordPath) =>
        isDefined(otherFlatRelatedRecordPath) &&
        otherFlatRelatedRecordPath.universalIdentifier !==
          universalFlatRelatedRecordPath.universalIdentifier &&
        otherFlatRelatedRecordPath.sourceObjectMetadataUniversalIdentifier ===
          sourceObjectMetadataUniversalIdentifier &&
        getRelatedRecordPathFieldMetadataUniversalIdentifiers(
          otherFlatRelatedRecordPath,
        ).join() === fieldMetadataUniversalIdentifiers.join(),
    );

    if (hasDuplicatePath) {
      return [
        buildInvalidInputError({
          message: t`This related record path already exists`,
          userFriendlyMessage: msg`This related record path already exists`,
        }),
      ];
    }

    return [];
  }

  public validateFlatRelatedRecordPathCreation({
    flatEntityToValidate: universalFlatRelatedRecordPath,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: universalFlatRelatedRecordPath.universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.collectPathErrors({
        universalFlatRelatedRecordPath,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatRelatedRecordPathDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRelatedRecordPathMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'delete',
    });

    const existingFlatRelatedRecordPath = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: flatRelatedRecordPathMaps,
    });

    if (!isDefined(existingFlatRelatedRecordPath)) {
      validationResult.errors.push(buildNotFoundError());
    }

    return validationResult;
  }

  public validateFlatRelatedRecordPathUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'update',
    });

    const existingFlatRelatedRecordPath = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRelatedRecordPathMaps,
    });

    if (!isDefined(existingFlatRelatedRecordPath)) {
      validationResult.errors.push(buildNotFoundError());

      return validationResult;
    }

    validationResult.errors.push(
      ...this.collectPathErrors({
        universalFlatRelatedRecordPath: {
          ...existingFlatRelatedRecordPath,
          ...flatEntityUpdate,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }
}
