import { t } from '@lingui/core/macro';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { runFlatObjectMetadataValidators } from 'src/engine/metadata-modules/flat-object-metadata/utils/run-flat-object-metadata-validators.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatObjectMetadataNames = ({
  namePlural,
  nameSingular,
}: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'> &
  ObjectMetadataMinimalInformation) => {
  const errors: FlatObjectMetadataValidationError[] = [];

  errors.push(
    ...[nameSingular, namePlural].flatMap((name) =>
      runFlatObjectMetadataValidators({
        elementToValidate: name,
        validators: METADATA_NAME_VALIDATORS,
      }),
    ),
  );

  const namesAreIdentical =
    namePlural.trim().toLowerCase() === nameSingular.trim().toLowerCase();

  if (namesAreIdentical) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: `The singular and plural names cannot be the same for an object`,
      userFriendlyMessage: t`The singular and plural names cannot be the same for an object`,
      value: namePlural,
    });
  }

  return errors;
};
