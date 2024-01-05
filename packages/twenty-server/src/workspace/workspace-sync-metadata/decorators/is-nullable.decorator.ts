import { TypedReflect } from 'src/utils/typed-reflect';

export function IsNullable() {
  return function (target: object, fieldKey: string) {
    TypedReflect.defineMetadata('isNullable', true, target, fieldKey);
  };
}
