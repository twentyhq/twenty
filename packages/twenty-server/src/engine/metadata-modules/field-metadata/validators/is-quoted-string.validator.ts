import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsQuotedString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isQuotedString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^'.*'$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a quoted string`;
        },
      },
    });
  };
}
