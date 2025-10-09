import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export type DatabaseEventTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatServerlessFunctionMaps'
>;
