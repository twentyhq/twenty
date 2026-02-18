import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export type FlatEntityMaps<T extends SyncableFlatEntity> =
  UniversalFlatEntityMaps<T> & {
    universalIdentifierById: Partial<Record<string, string>>;
    universalIdentifiersByApplicationId: Partial<Record<string, string[]>>;
  };
