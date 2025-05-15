import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsSystem() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey?: string | symbol): void {
    if (propertyKey !== undefined) {
      TypedReflect.defineMetadata(
        'workspace:is-system-metadata-args',
        true,
        target,
        propertyKey.toString(),
      );
    } else {
      TypedReflect.defineMetadata(
        'workspace:is-system-metadata-args',
        true,
        target,
      );
    }
  };
}
