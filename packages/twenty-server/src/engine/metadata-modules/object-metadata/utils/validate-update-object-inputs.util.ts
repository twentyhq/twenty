import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';

import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

const formatValidationErrors = (errors: ValidationError[]): string =>
  errors
    .flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }

      if (error.children) {
        return formatValidationErrors(error.children);
      }

      return [];
    })
    .join(', ');

// ResolverValidationPipe skips bare array arguments and the AI tools factory
// calls the service directly, so without this a batch would accept payloads
// updateOneObject rejects.
export const validateUpdateObjectInputs = (
  updateObjectInputs: UpdateOneObjectInput[],
): void => {
  const validationErrors = updateObjectInputs.flatMap((updateObjectInput) =>
    validateSync(plainToInstance(UpdateOneObjectInput, updateObjectInput)),
  );

  if (validationErrors.length > 0) {
    throw new ObjectMetadataException(
      formatValidationErrors(validationErrors),
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
