import { t } from '@lingui/core/macro';

import { FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { FlatObjectMetadataIdAndNames } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-id-and-names.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { runFlatObjectMetadataValidators } from 'src/engine/metadata-modules/flat-object-metadata/utils/run-flat-object-metadata-validators.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatObjectMetadataNames = ({
  namePlural,
  nameSingular,
  ...flatObjectMetadataIdAndNames
}: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'> &
  FlatObjectMetadataIdAndNames) => {
  const errors: FailedFlatObjectMetadataValidation[] = [];

  errors.push(
    ...[nameSingular, namePlural].flatMap((name) =>
      runFlatObjectMetadataValidators({
        elementToValidate: name,
        validators: METADATA_NAME_VALIDATORS,
        flatObjectMetadataIdAndNames,
      }),
    ),
  );

  const namesAreIdentical =
    namePlural.trim().toLowerCase() === nameSingular.trim().toLowerCase();

  if (namesAreIdentical) {
    errors.push({
      error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: t`The singular and plural names cannot be the same for an object`,
      nameSingular,
      namePlural,
    });
  }

  return errors;
};
