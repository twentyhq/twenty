import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export const IsQuotedString =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isQuotedString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && /^'.*'$/.test(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} must be a quoted string`,
      },
    });
  };
