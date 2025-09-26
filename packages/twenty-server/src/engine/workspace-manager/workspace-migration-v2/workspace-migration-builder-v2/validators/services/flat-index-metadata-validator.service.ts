import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMapsExceptionCode } from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { IndexExceptionCode } from 'src/engine/metadata-modules/flat-index-metadata/exceptions/index-exception-code';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-with-field-id-only.util';
import { IndexRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/index/workspace-migration-v2-index-actions-builder.service';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type IndexValidationArgs = {
  flatIndexToValidate: FlatIndexMetadata;
  optimisticFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  dependencyOptimisticFlatEntityMaps: IndexRelatedFlatEntityMaps;
};
@Injectable()
export class FlatIndexValidatorService {
  public validateFlatIndexDeletion({
    optimisticFlatIndexMaps,
    flatIndexToValidate: { id: indexIdToDelete },
  }: IndexValidationArgs): FailedFlatEntityValidation<FlatIndexMetadata> {
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
    flatIndexToValidate,
    optimisticFlatIndexMaps,
    dependencyOptimisticFlatEntityMaps: { flatObjectMetadataMaps },
  }: {
    flatIndexToValidate: FlatIndexMetadata;
    optimisticFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
    dependencyOptimisticFlatEntityMaps: IndexRelatedFlatEntityMaps;
  }): FailedFlatEntityValidation<FlatIndexMetadata> {
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
        userFriendlyMessage: t`Index already exists`,
      });
    }

    const relatedObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatIndexToValidate.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(relatedObjectMetadata)) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_OBJECT_NOT_FOUND,
        message: t`Could not find index related object metadata`,
        userFriendlyMessage: t`Index related object not found`,
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
        userFriendlyMessage: t`Index with same name already exists`,
      });
    }

    if (flatIndexToValidate.flatIndexFieldMetadatas.length === 0) {
      validationResult.errors.push({
        code: IndexExceptionCode.INDEX_EMPTY_FIELDS,
        message: t`Index must have at least one field`,
        userFriendlyMessage: t`An index must contain at least one field`,
      });
    } else {
      flatIndexToValidate.flatIndexFieldMetadatas.forEach((flatIndexField) => {
        const relatedFlatField =
          findFlatFieldMetadataInFlatObjectMetadataMapsWithOnlyFieldId({
            fieldMetadataId: flatIndexField.fieldMetadataId,
            flatObjectMetadataMaps,
          });

        if (!isDefined(relatedFlatField)) {
          validationResult.errors.push({
            code: IndexExceptionCode.INDEX_FIELD_NOT_FOUND,
            message: t`Could not find index field related field metadata`,
            userFriendlyMessage: t`Field referenced in index does not exist`,
          });
        } else {
          if (
            relatedFlatField.objectMetadataId !==
            flatIndexToValidate.objectMetadataId
          ) {
            validationResult.errors.push({
              code: IndexExceptionCode.INDEX_FIELD_WRONG_OBJECT,
              message: t`Field does not belong to the indexed object`,
              userFriendlyMessage: t`Field cannot be indexed as it belongs to a different object`,
            });
          }
        }

        if (flatIndexField.indexMetadataId !== flatIndexToValidate.id) {
          validationResult.errors.push({
            code: IndexExceptionCode.INDEX_FIELD_INVALID_REFERENCE,
            message: t`Index field references incorrect index metadata`,
            userFriendlyMessage: t`Index field has an invalid reference`,
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
            userFriendlyMessage: t`Field ID is already used in another index`,
          });
        }
      });
    }

    return validationResult;
  }
}
