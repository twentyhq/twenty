import { type SERIALIZED_RELATION_BRAND } from '@/types/SerializedRelation.type';

export type IsSerializedRelation<T> =
  typeof SERIALIZED_RELATION_BRAND extends keyof T ? true : false;
