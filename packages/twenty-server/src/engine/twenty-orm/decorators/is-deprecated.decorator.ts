import { TypedReflect } from 'src/utils/typed-reflect';

export function IsDeprecated(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (propertyKey !== undefined) {
      TypedReflect.defineMetadata(
        'workspace:is-deprecated-field-metadata-args',
        true,
        target,
        propertyKey.toString(),
      );
    } else {
      TypedReflect.defineMetadata(
        'workspace:is-deprecated-field-metadata-args',
        true,
        target,
      );
    }
  };
}
