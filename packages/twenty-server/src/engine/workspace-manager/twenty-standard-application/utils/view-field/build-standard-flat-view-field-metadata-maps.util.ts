import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardViewFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

type StandardViewFieldBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFieldArgs<P>, 'context'>,
) => Record<string, FlatViewField>;

const createEmptyFlatViewFieldMaps = (): FlatEntityMaps<FlatViewField> => ({
  byId: {},
  idByUniversalIdentifier: {},
  universalIdentifiersByApplicationId: {},
});

export const buildStandardFlatViewFieldMetadataMaps = (
  args: Omit<CreateStandardViewFieldArgs, 'context' | 'objectName'>,
  standardFlatViewFieldMetadataBuildersByObjectName: {
    [P in AllStandardObjectName]?: StandardViewFieldBuilder<P>;
  },
): FlatEntityMaps<FlatViewField> => {
  const allViewFieldMetadatas: FlatViewField[] = (
    Object.keys(
      standardFlatViewFieldMetadataBuildersByObjectName,
    ) as (keyof typeof standardFlatViewFieldMetadataBuildersByObjectName)[]
  ).flatMap((objectName) => {
    const builder = standardFlatViewFieldMetadataBuildersByObjectName[
      objectName
    ] as StandardViewFieldBuilder<typeof objectName>;

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewFieldMaps = createEmptyFlatViewFieldMaps();

  for (const viewFieldMetadata of allViewFieldMetadatas) {
    flatViewFieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFieldMetadata,
      flatEntityMaps: flatViewFieldMaps,
    });
  }

  return flatViewFieldMaps;
};

