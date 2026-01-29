import { type JSONB_PROPERTY_BRAND } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type HasJsonbPropertyBrand<T> =
  typeof JSONB_PROPERTY_BRAND extends keyof T ? true : false;
