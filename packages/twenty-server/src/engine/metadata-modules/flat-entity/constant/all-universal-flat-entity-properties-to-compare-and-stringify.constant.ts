import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';

type UniversalFlatEntityPropertiesToCompareAndStringify<
  T extends AllMetadataName,
> = {
  propertiesToCompare: MetadataUniversalFlatEntityPropertiesToCompare<T>[];
  propertiesToStringify: MetadataUniversalFlatEntityPropertiesToStringify<T>[];
};
const computeUniversalFlatEntityPropertiesToCompareAndStringify = <
  T extends AllMetadataName,
>(
  metadataName: T,
): UniversalFlatEntityPropertiesToCompareAndStringify<T> => {
  const entries = Object.entries(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
  ) as [
    string,
    { universalProperty: string | undefined; toStringify: boolean },
  ][];
  const accumulator: UniversalFlatEntityPropertiesToCompareAndStringify<T> = {
    propertiesToCompare: [],
    propertiesToStringify: [],
  };

  for (const [property, configuration] of entries) {
    const comparedProperty = configuration.universalProperty ?? property;

    accumulator.propertiesToCompare.push(
      comparedProperty as MetadataUniversalFlatEntityPropertiesToCompare<T>,
    );
    if (configuration.toStringify === true) {
      accumulator.propertiesToStringify.push(
        comparedProperty as MetadataUniversalFlatEntityPropertiesToStringify<T>,
      );
    }
  }

  return accumulator;
};

export const ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY =
  Object.values(ALL_METADATA_NAME).reduce(
    (acc, metadataName) => ({
      ...acc,
      [metadataName]:
        computeUniversalFlatEntityPropertiesToCompareAndStringify(metadataName),
    }),
    {} as {
      [P in AllMetadataName]: UniversalFlatEntityPropertiesToCompareAndStringify<P>;
    },
  );
