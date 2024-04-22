import { TypedReflect } from 'src/utils/typed-reflect';

export const IsSystem = () => (target: object, fieldKey?: string) => {
  if (fieldKey) {
    TypedReflect.defineMetadata('isSystem', true, target, fieldKey);
  } else {
    TypedReflect.defineMetadata('isSystem', true, target);
  }
};
