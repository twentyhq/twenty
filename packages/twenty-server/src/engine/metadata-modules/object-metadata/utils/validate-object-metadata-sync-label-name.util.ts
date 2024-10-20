import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { computeMetadataNameFromLabelOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';

export const validateNameAndLabelAreSyncOrThrow = (
  label: string,
  name: string,
) => {
  if (name !== computeMetadataNameFromLabelOrThrow(label)) {
    throw new ObjectMetadataException(
      `Name is not synced with label. Expected name: "${computeMetadataNameFromLabelOrThrow(label)}", got ${name}`,
      ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
    );
  }
};
