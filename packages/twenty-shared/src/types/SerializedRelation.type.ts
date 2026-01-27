export const SERIALIZED_RELATION_BRAND = '__SerializedRelationBrand__' as const;

export type SerializedRelation = string & {
  [SERIALIZED_RELATION_BRAND]?: never;
};
