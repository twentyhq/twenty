import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import {
    findFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow,
    type FindFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs,
} from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-in-flat-entity-maps-or-throw.util';

export const findFlatEntityByUniversalIdentifierInFlatEntityMaps = <
  T extends FlatEntity,
>(
  args: FindFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs<T>,
): T | undefined => {
  try {
    return findFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow(args);
  } catch {
    return undefined;
  }
};

