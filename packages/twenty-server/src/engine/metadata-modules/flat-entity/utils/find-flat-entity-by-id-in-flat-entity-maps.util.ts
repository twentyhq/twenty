import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import {
  findFlatEntityByIdInFlatEntityMapsOrThrow,
  type FindFlatEntityByIdInFlatEntityMapsOrThrowArgs,
} from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

export const findFlatEntityByIdInFlatEntityMaps = <
  T extends SyncableFlatEntity,
>(
  args: FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>,
): T | undefined => {
  try {
    return findFlatEntityByIdInFlatEntityMapsOrThrow(args);
  } catch {
    return undefined;
  }
};
