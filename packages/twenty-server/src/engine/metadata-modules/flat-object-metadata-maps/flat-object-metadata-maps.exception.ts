import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class FlatObjectMetadataMapsException extends CustomException<
  keyof typeof FlatObjectMetadataMapsExceptionCode
> {}

export const FlatObjectMetadataMapsExceptionCode = appendCommonExceptionCode({
  FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  FIELD_METADATA_ALREADY_EXISTS: 'FIELD_METADATA_ALREADY_EXISTS',
  OBJECT_METADATA_ALREADY_EXISTS: 'OBJECT_METADATA_ALREADY_EXISTS',
} as const);
