import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsDeprecated(): PropertyDecorator {
  return (object, propertyKey) => {
    TypedReflect.defineMetadata(
      'workspace:is-deprecated-field-metadata-args',
      true,
      object,
      propertyKey.toString(),
    );
  };
}
