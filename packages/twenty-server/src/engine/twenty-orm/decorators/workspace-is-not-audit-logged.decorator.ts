import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsNotAuditLogged() {
  return function (target: object) {
    TypedReflect.defineMetadata(
      'workspace:is-audit-logged-metadata-args',
      false,
      target,
    );
  };
}
