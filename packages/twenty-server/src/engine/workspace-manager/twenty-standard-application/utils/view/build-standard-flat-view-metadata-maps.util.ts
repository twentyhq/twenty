import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardViewArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

type StandardViewBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
) => Record<string, FlatView>;

export const buildStandardFlatViewMetadataMaps = (
  args: Omit<CreateStandardViewArgs, 'context' | 'objectName'>,
  standardFlatViewMetadataBuildersByObjectName: {
    [P in AllStandardObjectName]?: StandardViewBuilder<P>;
  },
): FlatEntityMaps<FlatView> => {
  const allViewMetadatas: FlatView[] = (
    Object.keys(
      standardFlatViewMetadataBuildersByObjectName,
    ) as (keyof typeof standardFlatViewMetadataBuildersByObjectName)[]
  ).flatMap((objectName) => {
    const builder = standardFlatViewMetadataBuildersByObjectName[
      objectName
    ] as StandardViewBuilder<typeof objectName>;

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewMaps = createEmptyFlatEntityMaps();

  for (const viewMetadata of allViewMetadatas) {
    flatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewMetadata,
      flatEntityMaps: flatViewMaps,
    });
  }

  return flatViewMaps;
};
