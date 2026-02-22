import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateNoOtherObjectWithSameNameExistsOrThrowsParams = {
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
  existingObjectMetadataUniversalIdentifier?: string;
  universalFlatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
};

export const doesOtherObjectWithSameNameExists = ({
  universalFlatObjectMetadataMaps,
  objectMetadataNamePlural,
  objectMetadataNameSingular,
  existingObjectMetadataUniversalIdentifier,
}: ValidateNoOtherObjectWithSameNameExistsOrThrowsParams) =>
  Object.values(universalFlatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .some(
      (universalFlatObjectMetadata) =>
        (universalFlatObjectMetadata.nameSingular ===
          objectMetadataNameSingular ||
          universalFlatObjectMetadata.namePlural === objectMetadataNamePlural ||
          universalFlatObjectMetadata.nameSingular ===
            objectMetadataNamePlural ||
          universalFlatObjectMetadata.namePlural ===
            objectMetadataNameSingular) &&
        universalFlatObjectMetadata.universalIdentifier !==
          existingObjectMetadataUniversalIdentifier,
    );

export const validateFlatObjectMetadataNameAndLabels = ({
  optimisticUniversalFlatObjectMetadataMaps,
  universalFlatObjectMetadataToValidate,
  buildOptions,
}: {
  universalFlatObjectMetadataToValidate: UniversalFlatObjectMetadata;
  optimisticUniversalFlatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatObjectMetadataValidationError[] => {
  const errors: FlatObjectMetadataValidationError[] = [];

  errors.push(
    ...validateFlatObjectMetadataNames({
      namePlural: universalFlatObjectMetadataToValidate.namePlural,
      nameSingular: universalFlatObjectMetadataToValidate.nameSingular,
    }),
  );

  errors.push(
    ...validateFlatObjectMetadataLabel({
      labelPlural: universalFlatObjectMetadataToValidate.labelPlural,
      labelSingular: universalFlatObjectMetadataToValidate.labelSingular,
    }),
  );

  if (
    universalFlatObjectMetadataToValidate.isLabelSyncedWithName &&
    !areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectdMetadata: universalFlatObjectMetadataToValidate,
      buildOptions,
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
      objectMetadataNamePlural:
        universalFlatObjectMetadataToValidate.namePlural,
      objectMetadataNameSingular:
        universalFlatObjectMetadataToValidate.nameSingular,
      universalFlatObjectMetadataMaps:
        optimisticUniversalFlatObjectMetadataMaps,
      existingObjectMetadataUniversalIdentifier:
        universalFlatObjectMetadataToValidate.universalIdentifier,
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
