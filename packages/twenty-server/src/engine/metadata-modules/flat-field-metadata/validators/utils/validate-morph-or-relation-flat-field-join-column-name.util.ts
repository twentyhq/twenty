import { msg } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export const validateMorphOrRelationFlatFieldJoinColumName = ({
  universalFlatFieldMetadata,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationBuilderOptions;
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'fieldMetadata'>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  switch (universalFlatFieldMetadata.universalSettings.relationType) {
    case RelationType.MANY_TO_ONE: {
      if (
        !isDefined(universalFlatFieldMetadata.universalSettings.joinColumnName)
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Many to one field metadata should carry the join column name in its settings',
          userFriendlyMessage: msg`A many to one relation field should always declare a join column`,
        });

        return errors;
      }

      const universalFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          universalFlatFieldMetadata.objectMetadataUniversalIdentifier,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(universalFlatObjectMetadata)) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'Could not find relation field parent flat object',
          userFriendlyMessage: msg`Could not find relation field parent flat object`,
        });

        return errors;
      }

      errors.push(
        ...validateFlatFieldMetadataNameAvailability({
          name: universalFlatFieldMetadata.universalSettings.joinColumnName,
          universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
          universalFlatObjectMetadata,
          buildOptions,
        }),
      );
      break;
    }
    case RelationType.ONE_TO_MANY: {
      if (
        isDefined(universalFlatFieldMetadata.universalSettings.joinColumnName)
      ) {
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
      assertUnreachable(
        universalFlatFieldMetadata.universalSettings.relationType,
      );
    }
  }

  return errors;
};
