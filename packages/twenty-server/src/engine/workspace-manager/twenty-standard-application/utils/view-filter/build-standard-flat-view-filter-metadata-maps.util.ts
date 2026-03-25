import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardTaskViewFilters } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/compute-standard-task-view-filters.util';
import { type CreateStandardViewFilterArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

type StandardViewFilterBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFilterArgs<P>, 'context'>,
) => Record<string, FlatViewFilter>;

const STANDARD_FLAT_VIEW_FILTER_METADATA_BUILDERS_BY_OBJECT_NAME = {
  task: computeStandardTaskViewFilters,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewFilterBuilder<P>;
};

export const buildStandardFlatViewFilterMetadataMaps = (
  args: Omit<CreateStandardViewFilterArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatViewFilter> => {
  const allViewFilterMetadatas: FlatViewFilter[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_FILTER_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_FILTER_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewFilterBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_FILTER_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewFilterMaps = createEmptyFlatEntityMaps();

  for (const viewFilterMetadata of allViewFilterMetadatas) {
    flatViewFilterMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFilterMetadata,
      flatEntityMaps: flatViewFilterMaps,
    });
  }

  return flatViewFilterMaps;
};
