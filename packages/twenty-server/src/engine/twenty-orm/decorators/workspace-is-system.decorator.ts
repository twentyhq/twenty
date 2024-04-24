import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsSystem() {
  return function (object: object, fieldKey?: string) {
    if (fieldKey) {
      TypedReflect.defineMetadata(
        'workspace:is-system-metadata-args',
        true,
        object,
        fieldKey,
      );
    } else {
      TypedReflect.defineMetadata(
        'workspace:is-system-metadata-args',
        true,
        object,
      );
    }
  };
}
