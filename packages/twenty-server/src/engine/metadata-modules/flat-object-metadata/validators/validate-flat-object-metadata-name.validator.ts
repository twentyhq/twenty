import { t } from '@lingui/core/macro';

import { type FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { runFlatObjectMetadataValidators } from 'src/engine/metadata-modules/flat-object-metadata/utils/run-flat-object-metadata-validators.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { METADATA_NAME_VALIDATORS } from 'src/engine/metadata-modules/utils/constants/metadata-name-flat-metadata-validators.constants';

export const validateFlatObjectMetadataNames = ({
  namePlural,
  nameSingular,
}: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>) => {
  const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

  errors.push(
    ...[nameSingular, namePlural].flatMap((name) =>
      runFlatObjectMetadataValidators(name, METADATA_NAME_VALIDATORS),
    ),
  );

  const namesAreIdentical =
    namePlural.trim().toLowerCase() === nameSingular.trim().toLowerCase();

  if (namesAreIdentical) {
    errors.push(
      new ObjectMetadataException(
        t`The singular and plural names cannot be the same for an object`,
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      ),
    );
  }

  return errors;
};
