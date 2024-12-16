import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class ForbiddenWordsConstraint implements ValidatorConstraintInterface {
  private forbiddenWords: Array<string | RegExp>;

  constructor() {}

  validate(value: string, validationArguments: ValidationArguments) {
    this.forbiddenWords = validationArguments.constraints[0];

    for (const elm of this.forbiddenWords) {
      if (typeof elm === 'string') {
        if (elm.toLowerCase() === value.toLowerCase()) {
          return false;
        }
      }

      if (elm instanceof RegExp) {
        if (elm.test(value)) {
          return false;
        }
      }
    }

    return true;
  }

  defaultMessage() {
    return `${Array.from(this.forbiddenWords).join(', ')} are not allowed`;
  }
}

export function ForbiddenWords(
  forbiddenWords: Array<string | RegExp>,
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
