export const JSONB_PROPERTY_BRAND = '__JsonbPropertyBrand__' as const;
export type JsonbProperty<T> = T & { [JSONB_PROPERTY_BRAND]?: never };
