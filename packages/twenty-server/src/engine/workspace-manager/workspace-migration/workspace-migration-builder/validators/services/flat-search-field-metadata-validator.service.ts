import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { SearchFieldMetadataExceptionCode } from 'src/engine/metadata-modules/search-field-metadata/exceptions/search-field-metadata.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatSearchFieldMetadataValidatorService {
  constructor() {}

  validateFlatSearchFieldMetadataCreation({
    flatEntityToValidate: flatSearchFieldMetadataToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSearchFieldMetadataMaps: optimisticFlatSearchFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.searchFieldMetadata
  >): FailedFlatEntityValidation<'searchFieldMetadata', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier:
          flatSearchFieldMetadataToValidate.universalIdentifier,
        objectMetadataUniversalIdentifier:
          flatSearchFieldMetadataToValidate.objectMetadataUniversalIdentifier,
      },
      metadataName: 'searchFieldMetadata',
      type: 'create',
    });

    const existingFlatSearchFieldMetadata = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier:
          flatSearchFieldMetadataToValidate.universalIdentifier,
        flatEntityMaps: optimisticFlatSearchFieldMetadataMaps,
      },
    );

    if (isDefined(existingFlatSearchFieldMetadata)) {
      const searchFieldMetadataId =
        flatSearchFieldMetadataToValidate.universalIdentifier;

      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.INVALID_SEARCH_FIELD_METADATA_DATA,
        message: t`Search field metadata with id ${searchFieldMetadataId} already exists`,
        userFriendlyMessage: msg`Search field metadata already exists`,
      });
    }

    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatSearchFieldMetadataToValidate.fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const flatTsVectorFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatSearchFieldMetadataToValidate.tsVectorFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatTsVectorFieldMetadata)) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.TS_VECTOR_FIELD_METADATA_NOT_FOUND,
        message: t`TS_VECTOR field metadata not found`,
        userFriendlyMessage: msg`Search vector field not found`,
      });
    } else {
      if (flatTsVectorFieldMetadata.type !== FieldMetadataType.TS_VECTOR) {
        validationResult.errors.push({
          code: SearchFieldMetadataExceptionCode.INVALID_TS_VECTOR_FIELD_METADATA,
          message: t`TS_VECTOR field metadata must be of type TS_VECTOR`,
          userFriendlyMessage: msg`Search vector field must be a search vector`,
        });
      }

      if (
        flatTsVectorFieldMetadata.objectMetadataUniversalIdentifier !==
        flatSearchFieldMetadataToValidate.objectMetadataUniversalIdentifier
      ) {
        validationResult.errors.push({
          code: SearchFieldMetadataExceptionCode.INVALID_TS_VECTOR_FIELD_METADATA,
          message: t`TS_VECTOR field metadata must belong to the same object`,
          userFriendlyMessage: msg`Search vector field must belong to the same object`,
        });
      }
    }

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatSearchFieldMetadataToValidate.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });

      return validationResult;
    }

    const otherFlatSearchFieldMetadatas =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
        universalIdentifiers:
          flatObjectMetadata.searchFieldMetadataUniversalIdentifiers,
        flatEntityMaps: optimisticFlatSearchFieldMetadataMaps,
      });

    const equivalentExistingFlatSearchFieldMetadataExists =
      otherFlatSearchFieldMetadatas.some(
        (flatSearchFieldMetadata) =>
          flatSearchFieldMetadata.universalIdentifier !==
            flatSearchFieldMetadataToValidate.universalIdentifier &&
          flatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
            flatSearchFieldMetadataToValidate.fieldMetadataUniversalIdentifier,
      );

    if (equivalentExistingFlatSearchFieldMetadataExists) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.INVALID_SEARCH_FIELD_METADATA_DATA,
        message: t`Search field metadata with same fieldMetadataId and objectMetadataId already exists`,
        userFriendlyMessage: msg`Search field metadata already exists`,
      });
    }

    return validationResult;
  }

  public validateFlatSearchFieldMetadataUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSearchFieldMetadataMaps: optimisticFlatSearchFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.searchFieldMetadata
  >): FailedFlatEntityValidation<'searchFieldMetadata', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'searchFieldMetadata',
      type: 'update',
    });

    const existingFlatSearchFieldMetadata = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier,
        flatEntityMaps: optimisticFlatSearchFieldMetadataMaps,
      },
    );

    if (!isDefined(existingFlatSearchFieldMetadata)) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.SEARCH_FIELD_METADATA_NOT_FOUND,
        message: t`Search field metadata to update not found`,
        userFriendlyMessage: msg`Search field metadata to update not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatSearchFieldMetadataDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSearchFieldMetadataMaps: optimisticFlatSearchFieldMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.searchFieldMetadata
  >): FailedFlatEntityValidation<'searchFieldMetadata', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'searchFieldMetadata',
      type: 'delete',
    });

    const existingFlatSearchFieldMetadata = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier,
        flatEntityMaps: optimisticFlatSearchFieldMetadataMaps,
      },
    );

    if (!isDefined(existingFlatSearchFieldMetadata)) {
      validationResult.errors.push({
        code: SearchFieldMetadataExceptionCode.SEARCH_FIELD_METADATA_NOT_FOUND,
        message: t`Search field metadata to delete not found`,
        userFriendlyMessage: msg`Search field metadata to delete not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
