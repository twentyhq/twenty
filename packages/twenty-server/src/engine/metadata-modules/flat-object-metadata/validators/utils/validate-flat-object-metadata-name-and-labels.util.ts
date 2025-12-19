import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

type ValidateNoOtherObjectWithSameNameExistsOrThrowsParams = {
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
  existingObjectMetadataId?: string;
  objectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const doesOtherObjectWithSameNameExists = ({
  objectMetadataMaps,
  objectMetadataNamePlural,
  objectMetadataNameSingular,
  existingObjectMetadataId,
}: ValidateNoOtherObjectWithSameNameExistsOrThrowsParams) =>
  Object.values(objectMetadataMaps.byId)
    .filter(isDefined)
    .some(
      (objectMetadata) =>
        (objectMetadata.nameSingular === objectMetadataNameSingular ||
          objectMetadata.namePlural === objectMetadataNamePlural ||
          objectMetadata.nameSingular === objectMetadataNamePlural ||
          objectMetadata.namePlural === objectMetadataNameSingular) &&
        objectMetadata.id !== existingObjectMetadataId,
    );

export const validateFlatObjectMetadataNameAndLabels = ({
  optimisticFlatObjectMetadataMaps,
  flatObjectMetadataToValidate,
  buildOptions,
}: {
  flatObjectMetadataToValidate: FlatObjectMetadata;
  optimisticFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatObjectMetadataValidationError[] => {
  const errors: FlatObjectMetadataValidationError[] = [];

  errors.push(
    ...validateFlatObjectMetadataNames({
      namePlural: flatObjectMetadataToValidate.namePlural,
      nameSingular: flatObjectMetadataToValidate.nameSingular,
    }),
  );

  errors.push(
    ...validateFlatObjectMetadataLabel({
      labelPlural: flatObjectMetadataToValidate.labelPlural,
      labelSingular: flatObjectMetadataToValidate.labelSingular,
    }),
  );

  if (
    flatObjectMetadataToValidate.isLabelSyncedWithName &&
    !areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectdMetadata: flatObjectMetadataToValidate,
      isSystemBuild: buildOptions.isSystemBuild,
    })
  ) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: t`Names are not synced with labels`,
      userFriendlyMessage: msg`Names are not synced with labels`,
    });
  }

  if (
    doesOtherObjectWithSameNameExists({
      objectMetadataNamePlural: flatObjectMetadataToValidate.namePlural,
      objectMetadataNameSingular: flatObjectMetadataToValidate.nameSingular,
      objectMetadataMaps: optimisticFlatObjectMetadataMaps,
      existingObjectMetadataId: flatObjectMetadataToValidate.id,
    })
  ) {
    errors.push({
      code: ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
      message: 'Object already exists',
      userFriendlyMessage: msg`Object already exists`,
    });
  }

  return errors;
};
