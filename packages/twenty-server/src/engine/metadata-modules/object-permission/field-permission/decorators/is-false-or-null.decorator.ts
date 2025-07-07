import { ValidateIf, ValidationOptions, isDefined } from 'class-validator';

export function IsFalseOrNull(validationOptions?: ValidationOptions) {
  return ValidateIf((_obj, value) => {
    return isDefined(value) && value !== false && value !== null;
  }, validationOptions);
}
