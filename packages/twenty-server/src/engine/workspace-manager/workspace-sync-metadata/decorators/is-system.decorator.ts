import { TypedReflect } from 'src/utils/typed-reflect';

export function IsSystem() {
  return function (target: object, fieldKey?: string) {
    if (fieldKey) {
      TypedReflect.defineMetadata('isSystem', true, target, fieldKey);
    } else {
      TypedReflect.defineMetadata('isSystem', true, target);
    }
  };
}
