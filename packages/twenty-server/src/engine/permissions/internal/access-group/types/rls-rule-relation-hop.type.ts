import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export type RlsRuleRelationHop = {
  relationFieldMetadata: OrmFlatFieldMetadata;
  comparedFieldMetadataIds: string[];
};
