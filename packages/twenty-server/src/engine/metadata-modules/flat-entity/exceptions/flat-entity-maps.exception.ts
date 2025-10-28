import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class FlatEntityMapsException extends CustomException<
  keyof typeof FlatEntityMapsExceptionCode
> {}

export const FlatEntityMapsExceptionCode = appendCommonExceptionCode({
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_MALFORMED: 'ENTITY_MALFORMED',
} as const);
