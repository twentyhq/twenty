import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const graphQLEnumNameRegex = /^[_A-Za-z][_0-9A-Za-z]+$/;

export const IsValidGraphQLEnumName =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidGraphQLEnumName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && graphQLEnumNameRegex.test(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} must match the ${graphQLEnumNameRegex} format`,
      },
    });
  };
