import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

export type ViewFieldRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatFieldMetadataMaps'
>;
