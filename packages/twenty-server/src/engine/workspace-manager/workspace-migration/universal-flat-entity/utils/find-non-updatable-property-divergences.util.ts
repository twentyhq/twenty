import { isUndefined } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToReportDivergence } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-report-divergence.type';

// An undefined incoming property (removed column, workspace-owned value) is not part of the change
export const findNonUpdatablePropertyDivergences = <T extends AllMetadataName>({
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  metadataName,
}: FromTo<MetadataUniversalFlatEntity<T>, 'universalFlatEntity'> & {
  metadataName: T;
}): MetadataUniversalFlatEntityPropertiesToReportDivergence<T>[] =>
  ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[
    metadataName
  ].propertiesToReportDivergence.filter(
    (property) =>
      !isUndefined(toUniversalFlatEntity[property]) &&
      !isEqual(
        fromUniversalFlatEntity[property],
        toUniversalFlatEntity[property],
      ),
  );
