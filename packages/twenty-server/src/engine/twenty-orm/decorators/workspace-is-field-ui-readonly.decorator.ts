import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsFieldUIReadOnly() {
  return function (target: object, propertyKey?: string | symbol): void {
    if (propertyKey === undefined) {
      throw new Error('This decorator should be used with a field not a class');
    }

    TypedReflect.defineMetadata(
      'workspace:is-field-ui-readonly-metadata-args',
      true,
      target,
      propertyKey.toString(),
    );
  };
}
