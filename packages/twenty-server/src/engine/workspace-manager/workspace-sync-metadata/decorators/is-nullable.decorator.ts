import { TypedReflect } from 'src/utils/typed-reflect';

export const IsNullable = () => (target: object, fieldKey: string) => {
  TypedReflect.defineMetadata('isNullable', true, target, fieldKey);
};
