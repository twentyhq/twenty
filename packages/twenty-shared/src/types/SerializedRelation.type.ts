export declare const SerializedRelationBrand: unique symbol;
export type SerializedRelation = string & {
  [SerializedRelationBrand]?: true;
};
