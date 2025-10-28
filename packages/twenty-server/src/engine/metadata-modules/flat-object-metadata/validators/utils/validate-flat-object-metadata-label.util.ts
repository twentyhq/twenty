import { msg } from '@lingui/core/macro';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataMinimalInformation } from 'src/engine/metadata-modules/flat-object-metadata/types/object-metadata-minimal-information.type';
import { runFlatObjectMetadataValidators } from 'src/engine/metadata-modules/flat-object-metadata/utils/run-flat-object-metadata-validators.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateFlatObjectMetadataLabel = ({
  labelPlural,
  labelSingular,
}: Pick<FlatObjectMetadata, 'labelPlural' | 'labelSingular'> &
  ObjectMetadataMinimalInformation): FlatObjectMetadataValidationError[] => {
  const errors: FlatObjectMetadataValidationError[] = [];
  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: (label) => beneathDatabaseIdentifierMinimumLength(label),
      message: msg`Object label is too short`,
    },
    {
      validator: (label) => exceedsDatabaseIdentifierMaximumLength(label),
      message: msg`Object label is too long`,
    },
  ];

  errors.push(
    ...[labelSingular, labelPlural].flatMap((label) =>
      runFlatObjectMetadataValidators({
        elementToValidate: label,
        validators,
      }),
    ),
  );

  const labelsAreIdentical =
    labelSingular.trim().toLowerCase() === labelPlural.trim().toLowerCase();

  if (labelsAreIdentical) {
    errors.push({
      code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: `The singular and plural labels cannot be the same for an object`,
      userFriendlyMessage: msg`The singular and plural labels cannot be the same for an object`,
      value: labelSingular,
    });
  }

  return errors;
};
