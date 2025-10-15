import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isValidUniqueFieldDefaultValueCombination } from 'src/engine/metadata-modules/field-metadata/utils/is-valid-unique-input.util';
import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { IndexExceptionCode } from 'src/engine/metadata-modules/flat-index-metadata/exceptions/index-exception-code';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

@Injectable()
export class FlatIndexValidatorService {
  public validateFlatIndexDeletion({
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
    flatEntityToValidate: { id: indexIdToDelete },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.index
  >): FailedFlatEntityValidation<FlatIndexMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatIndexMetadata> = {
      type: 'delete_index',
      errors: [],
      flatEntityMinimalInformation: {
        id: indexIdToDelete,
      },
    };

    const existingFlatIndexToDelete = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: indexIdToDelete,
      flatEntityMaps: optimisticFlatIndexMaps,
    });

    if (!isDefined(existingFlatIndexToDelete)) {
      validationResult.errors.push({
        code: FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        message: t`Index to delete not found`,
      });
    }

    return validationResult;
  }

  public validateFlatIndexCreation({
    flatEntityToValidate: flatIndexToValidate,
    optimisticFlatEntityMaps: optimisticFlatIndexMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.index
  >): FailedFlatEntityValidation<FlatIndexMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatIndexMetadata> = {
      type: 'create_index',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatIndexToValidate.id,
        name: flatIndexToValidate.name,
      },
    };

    const existingFlatIndex = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatIndexToValidate.id,
      flatEntityMaps: optimisticFlatIndexMaps,
    });

    if (isDefined(existingFlatIndex)) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_ALREADY_EXISTS,
        message: t`Index with same id already exists`,
        userFriendlyMessage: msg`Index already exists`,
      });
    }

    const relatedObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps: dependencyOptimisticFlatEntityMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(relatedObjectMetadata)) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_OBJECT_NOT_FOUND,
        message: t`Could not find index related object metadata`,
        userFriendlyMessage: msg`Index related object not found`,
      });
    }

    const allExistingFlatIndex = Object.values(
      optimisticFlatIndexMaps.byId,
    ).filter(isDefined);

    const existingFlatIndexOnName = allExistingFlatIndex.find(
      (flatIndexMetadata) =>
        flatIndexMetadata.name.toLocaleUpperCase() ===
        flatIndexToValidate.name.toLocaleUpperCase(),
    );

    if (isDefined(existingFlatIndexOnName)) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_ALREADY_EXISTS,
        message: t`Index with same name already exists`,
        userFriendlyMessage: msg`Index with same name already exists`,
      });
    }

    if (flatIndexToValidate.flatIndexFieldMetadatas.length === 0) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_EMPTY_FIELDS,
        message: t`Index must have at least one field`,
        userFriendlyMessage: msg`An index must contain at least one field`,
      });
    } else {
      flatIndexToValidate.flatIndexFieldMetadatas.forEach((flatIndexField) => {
        const relatedFlatField = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatIndexField.fieldMetadataId,
          flatEntityMaps:
            dependencyOptimisticFlatEntityMaps.flatFieldMetadataMaps,
        });

        if (!isDefined(relatedFlatField)) {
          validationResult.errors.push({
            code: IndexExceptionCode.INDEX_FIELD_NOT_FOUND,
            message: t`Could not find index field related field metadata`,
            userFriendlyMessage: msg`Field referenced in index does not exist`,
          });
        } else {
          if (
            relatedFlatField.objectMetadataId !==
            flatIndexToValidate.objectMetadataId
          ) {
            validationResult.errors.push({
              code: IndexExceptionCode.INDEX_FIELD_WRONG_OBJECT,
              message: t`Field does not belong to the indexed object`,
              userFriendlyMessage: msg`Field cannot be indexed as it belongs to a different object`,
            });
          }

          if (flatIndexToValidate.isUnique) {
            if (
              isDefined(relatedFlatField.defaultValue) &&
              !isValidUniqueFieldDefaultValueCombination({
                defaultValue: relatedFlatField.defaultValue,
                isUnique: relatedFlatField.isUnique ?? false,
                type: relatedFlatField.type,
              })
            ) {
              const fieldName = relatedFlatField.name;
              const fieldType = relatedFlatField.type;

              validationResult.errors.push({
                code: IndexExceptionCode.INDEX_FIELD_INVALID_DEFAULT_VALUE,
                message: t`Unique index cannot be created for field ${fieldName} of type ${fieldType}`,
                userFriendlyMessage: msg`${fieldType} fields cannot have a default value.`,
              });
            }

            const isCompositeFieldWithNonIncludedUniqueConstraint =
              isCompositeFlatFieldMetadata(relatedFlatField) &&
              !compositeTypeDefinitions
                .get(relatedFlatField.type)
                ?.properties.some(
                  (property) => property.isIncludedInUniqueConstraint,
                );

            if (
              [
                FieldMetadataType.MORPH_RELATION,
                FieldMetadataType.RELATION,
              ].includes(relatedFlatField.type) ||
              isCompositeFieldWithNonIncludedUniqueConstraint
            ) {
              const fieldType = relatedFlatField.type;
              const fieldName = relatedFlatField.name;

              validationResult.errors.push({
                code: IndexExceptionCode.INDEX_FIELD_INVALID_TYPE_FOR_UNIQUE,
                message: t`Unique index cannot be created for field ${fieldName} of type ${fieldType}`,
                userFriendlyMessage: msg`${fieldType} fields cannot be unique.`,
              });
            }
          }
        }

        if (flatIndexField.indexMetadataId !== flatIndexToValidate.id) {
          validationResult.errors.push({
            code: IndexExceptionCode.INDEX_FIELD_INVALID_REFERENCE,
            message: t`Index field references incorrect index metadata`,
            userFriendlyMessage: msg`Index field has an invalid reference`,
          });
        }

        if (
          allExistingFlatIndex.some(({ flatIndexFieldMetadatas }) =>
            flatIndexFieldMetadatas.some(({ id }) => id === flatIndexField.id),
          )
        ) {
          validationResult.errors.push({
            code: IndexExceptionCode.INDEX_FIELD_ID_DUPLICATE,
            message: t`Index field ID already exists in another index`,
            userFriendlyMessage: msg`Field ID is already used in another index`,
          });
        }
      });
    }

    return validationResult;
  }
}
