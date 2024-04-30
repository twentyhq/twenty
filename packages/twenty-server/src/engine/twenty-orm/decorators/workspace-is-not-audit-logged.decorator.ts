import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceIsNotAuditLogged(): ClassDecorator {
  return (object) => {
    TypedReflect.defineMetadata(
      'workspace:is-audit-logged-metadata-args',
      false,
      object,
    );
  };
}
