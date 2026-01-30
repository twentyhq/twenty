import { type HasJsonbBrandInUnion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/has-jsonb-brand-in-union.type';

export type ExtractJsonbProperties<T> = NonNullable<
  {
    [P in keyof T]-?: true extends HasJsonbBrandInUnion<NonNullable<T[P]>>
      ? P
      : never;
  }[keyof T]
>;
