import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type FieldSideEffectFlatEntities = {
  indexes: UniversalFlatIndexMetadata[];
};

export const EMPTY_FIELD_SIDE_EFFECT_FLAT_ENTITIES: FieldSideEffectFlatEntities =
  {
    indexes: [],
  };
