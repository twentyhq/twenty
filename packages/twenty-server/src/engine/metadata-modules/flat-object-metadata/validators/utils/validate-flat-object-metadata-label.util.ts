import { t } from '@lingui/core/macro';

import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type FlatObjectMetadataIdAndNames } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-id-and-names.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
  ...flatObjectMetadataIdAndNames
}: Pick<FlatObjectMetadata, 'labelPlural' | 'labelSingular'> &
  FlatObjectMetadataIdAndNames): FailedFlatObjectMetadataValidation[] => {
  const errors: FailedFlatObjectMetadataValidation[] = [];
  const validators: FlatMetadataValidator<string>[] = [
    {
      validator: (label) => beneathDatabaseIdentifierMinimumLength(label),
      message: t`Object label is too short`,
    },
    {
      validator: (label) => exceedsDatabaseIdentifierMaximumLength(label),
      message: t`Object label is too long`,
    },
  ];

  errors.push(
    ...[labelSingular, labelPlural].flatMap((label) =>
      runFlatObjectMetadataValidators({
        elementToValidate: label,
        flatObjectMetadataIdAndNames,
        validators,
      }),
    ),
  );

  const labelsAreIdentical =
    labelSingular.trim().toLowerCase() === labelPlural.trim().toLowerCase();

  if (labelsAreIdentical) {
    errors.push({
      error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      message: t`The singular and plural labels cannot be the same for an object`,
      ...flatObjectMetadataIdAndNames,
    });
  }

  return errors;
};
