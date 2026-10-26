import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isEmptyObject } from 'twenty-shared/utils';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { diffUniversalFlatEntityProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/diff-universal-flat-entity-properties.util';
import { findNonUpdatablePropertyDivergences } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/find-non-updatable-property-divergences.util';

type CompareTwoUniversalFlatEntityArgs<T extends AllMetadataName> = FromTo<
  MetadataUniversalFlatEntity<T>,
  'universalFlatEntity'
> & { metadataName: T };

export type UniversalFlatEntityComparison<T extends AllMetadataName> = {
  update: UniversalFlatEntityUpdate<T>;
  nonUpdatablePropertyDivergences: string[];
};

export const compareTwoFlatEntity = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: CompareTwoUniversalFlatEntityArgs<T>):
  | UniversalFlatEntityComparison<T>
  | undefined => {
  const update: UniversalFlatEntityUpdate<T> =
    diffUniversalFlatEntityProperties({
      fromUniversalFlatEntity,
      toUniversalFlatEntity,
      metadataName,
      properties:
        ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[
          metadataName
        ].propertiesToCompare,
    });

  const nonUpdatablePropertyDivergences = findNonUpdatablePropertyDivergences({
    fromUniversalFlatEntity,
    toUniversalFlatEntity,
    metadataName,
  });

  if (isEmptyObject(update) && nonUpdatablePropertyDivergences.length === 0) {
    return undefined;
  }

  return { update, nonUpdatablePropertyDivergences };
};
