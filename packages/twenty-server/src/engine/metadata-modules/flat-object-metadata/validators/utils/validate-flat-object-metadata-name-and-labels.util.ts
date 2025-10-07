import { t } from '@lingui/core/macro';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { doesOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';

export const validateFlatObjectMetadataNameAndLabels = ({
  optimisticFlatObjectMetadataMaps,
  flatObjectMetadataToValidate,
}: {
  flatObjectMetadataToValidate: FlatObjectMetadata;
  optimisticFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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
    !areFlatObjectMetadataNamesSyncedWithLabels(flatObjectMetadataToValidate)
  ) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: t`Names are not synced with labels`,
      userFriendlyMessage: t`Names are not synced with labels`,
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
      userFriendlyMessage: t`Object already exists`,
    });
  }

  return errors;
};
