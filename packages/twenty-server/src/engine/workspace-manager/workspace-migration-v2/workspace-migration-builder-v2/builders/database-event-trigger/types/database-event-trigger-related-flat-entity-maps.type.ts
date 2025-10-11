import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

export type DatabaseEventTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatServerlessFunctionMaps'
>;
