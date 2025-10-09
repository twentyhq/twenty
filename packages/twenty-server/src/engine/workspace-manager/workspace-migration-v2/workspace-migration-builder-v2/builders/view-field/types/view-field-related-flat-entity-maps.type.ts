import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type ViewFieldRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
>;
