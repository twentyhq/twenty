import {
  type ValidationArguments,
  type ValidationOptions,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any) {
          return typeof value === 'string' && /^'{1}.*'{1}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a quoted string`;
        },
      },
    });
  };
}
