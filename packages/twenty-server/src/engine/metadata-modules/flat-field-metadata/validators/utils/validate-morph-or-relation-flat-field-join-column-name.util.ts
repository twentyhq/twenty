import { msg } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export const validateMorphOrRelationFlatFieldJoinColumName = ({
  flatFieldMetadata,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForValidation<'fieldMetadata'>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  switch (flatFieldMetadata.settings.relationType) {
    case RelationType.MANY_TO_ONE: {
      if (!isDefined(flatFieldMetadata.settings.joinColumnName)) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Many to one field metadata should carry the join column name in its settings',
          userFriendlyMessage: msg`A many to one relation field should always declare a join column`,
        });

        return errors;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'Could not find relation field parent flat object',
          userFriendlyMessage: msg`Could not find relation field parent flat object`,
        });

        return errors;
      }

      errors.push(
        ...validateFlatFieldMetadataNameAvailability({
          name: flatFieldMetadata.settings.joinColumnName,
          flatFieldMetadataMaps,
          flatObjectMetadata,
          buildOptions,
        }),
      );
      break;
    }
    case RelationType.ONE_TO_MANY: {
      if (isDefined(flatFieldMetadata.settings.joinColumnName)) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'One to many field metadata should not carry the join column name in its settings',
          userFriendlyMessage: msg`A one to many relation field should never declare a join column`,
        });
      }
      break;
    }
    default: {
      assertUnreachable(flatFieldMetadata.settings.relationType);
    }
  }

  return errors;
};
