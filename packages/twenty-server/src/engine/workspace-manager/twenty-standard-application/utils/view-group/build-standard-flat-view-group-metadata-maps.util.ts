import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardOpportunityViewGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/compute-standard-opportunity-view-groups.util';
import { type CreateStandardViewGroupArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/create-standard-view-group-flat-metadata.util';
import { computeStandardTaskViewGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/compute-standard-task-view-groups.util';

type StandardViewGroupBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewGroupArgs<P>, 'context'>,
) => Record<string, FlatViewGroup>;

const STANDARD_FLAT_VIEW_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME = {
  opportunity: computeStandardOpportunityViewGroups,
  task: computeStandardTaskViewGroups,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewGroupBuilder<P>;
};

export const buildStandardFlatViewGroupMetadataMaps = (
  args: Omit<CreateStandardViewGroupArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatViewGroup> => {
  const allViewGroupMetadatas: FlatViewGroup[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewGroupBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewGroupMaps = createEmptyFlatEntityMaps();

  for (const viewGroupMetadata of allViewGroupMetadatas) {
    flatViewGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewGroupMetadata,
      flatEntityMaps: flatViewGroupMaps,
    });
  }

  return flatViewGroupMaps;
};
