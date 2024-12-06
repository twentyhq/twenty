import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class ForbiddenWordsConstraint implements ValidatorConstraintInterface {
  private forbiddenWords: Set<string>;

  constructor() {}

  validate(value: string, validationArguments: ValidationArguments) {
    this.forbiddenWords = new Set(validationArguments.constraints[0]);

    return !this.forbiddenWords.has(value);
  }

  defaultMessage() {
    return `${Array.from(this.forbiddenWords).join(', ')} are not allowed`;
  }
}

export function ForbiddenWords(
  forbiddenWords: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [forbiddenWords],
      validator: ForbiddenWordsConstraint,
    });
  };
}
