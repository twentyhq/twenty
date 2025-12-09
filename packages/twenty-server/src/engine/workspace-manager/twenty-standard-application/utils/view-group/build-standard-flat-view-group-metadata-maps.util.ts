import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardViewGroupArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/create-standard-view-group-flat-metadata.util';

type StandardViewGroupBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewGroupArgs<P>, 'context'>,
) => Record<string, FlatViewGroup>;

const createEmptyFlatViewGroupMaps = (): FlatEntityMaps<FlatViewGroup> => ({
  byId: {},
  idByUniversalIdentifier: {},
  universalIdentifiersByApplicationId: {},
});

export const buildStandardFlatViewGroupMetadataMaps = (
  args: Omit<CreateStandardViewGroupArgs, 'context' | 'objectName'>,
  standardFlatViewGroupMetadataBuildersByObjectName: {
    [P in AllStandardObjectName]?: StandardViewGroupBuilder<P>;
  },
): FlatEntityMaps<FlatViewGroup> => {
  const allViewGroupMetadatas: FlatViewGroup[] = (
    Object.keys(
      standardFlatViewGroupMetadataBuildersByObjectName,
    ) as (keyof typeof standardFlatViewGroupMetadataBuildersByObjectName)[]
  ).flatMap((objectName) => {
    const builder = standardFlatViewGroupMetadataBuildersByObjectName[
      objectName
    ] as StandardViewGroupBuilder<typeof objectName>;

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewGroupMaps = createEmptyFlatViewGroupMaps();

  for (const viewGroupMetadata of allViewGroupMetadatas) {
    flatViewGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewGroupMetadata,
      flatEntityMaps: flatViewGroupMaps,
    });
  }

  return flatViewGroupMaps;
};

