import { type HasJsonbPropertyBrand } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/has-jsonb-brand.type';

export type HasJsonbBrandInUnion<T> = T extends unknown
  ? HasJsonbPropertyBrand<T>
  : never;
