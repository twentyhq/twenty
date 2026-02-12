import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntityPropertiesToCompare } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type';
import { type MetadataUniversalFlatEntityPropertiesToStringify } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-stringify.type';

type PropertyConfiguration = {
  universalProperty: string | undefined;
  toStringify: boolean;
  toCompare: boolean;
};

// TODO remove once https://github.com/twentyhq/core-team-issues/issues/2227 has been resolved
const EXTRA_PROPERTIES_TO_COMPARE = {
  index: {
    flatIndexFieldMetadatas: {
      toStringify: true,
      universalProperty: 'universalFlatIndexFieldMetadatas',
      toCompare: true,
    },
  },
} as const satisfies {
  [P in AllMetadataName]?: Partial<
    Record<keyof MetadataFlatEntity<P>, PropertyConfiguration>
  >;
};

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
  const entries = Object.entries({
    ...ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName],
    ...EXTRA_PROPERTIES_TO_COMPARE[
      metadataName as keyof typeof EXTRA_PROPERTIES_TO_COMPARE
    ],
  }) as [string, PropertyConfiguration][];

  const accumulator: UniversalFlatEntityPropertiesToCompareAndStringify<T> = {
    propertiesToCompare: [],
    propertiesToStringify: [],
  };

  for (const [property, configuration] of entries) {
    if (!configuration.toCompare) {
      continue;
    }

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
