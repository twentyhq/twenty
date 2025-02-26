import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsSearchable() {
  return function (target: any): void {
    TypedReflect.defineMetadata(
      'workspace:is-searchable-metadata-args',
      true,
      target,
    );
  };
}
