import { TypedReflect } from 'src/utils/typed-reflect';

export function IsNotAuditLogged() {
  return function (target: object) {
    TypedReflect.defineMetadata('isAuditLogged', false, target);
  };
}
