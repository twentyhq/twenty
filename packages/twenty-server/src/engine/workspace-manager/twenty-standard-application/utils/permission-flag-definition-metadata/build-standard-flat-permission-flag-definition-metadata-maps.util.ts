import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatPermissionFlagDefinition } from 'src/engine/metadata-modules/flat-permission-flag-definition/types/flat-permission-flag-definition.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type CreateStandardPermissionFlagDefinitionArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-definition-metadata/create-standard-permission-flag-definition-flat-metadata.util';
import { STANDARD_FLAT_PERMISSION_FLAG_DEFINITION_METADATA_BUILDERS_BY_KEY } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-definition-metadata/create-standard-flat-permission-flag-definition-metadata.util';

export const buildStandardFlatPermissionFlagDefinitionMetadataMaps = (
  args: Omit<CreateStandardPermissionFlagDefinitionArgs, 'context'>,
): FlatEntityMaps<FlatPermissionFlagDefinition> => {
  const allPermissionFlagDefinitionMetadatas: FlatPermissionFlagDefinition[] =
    Object.values(
      STANDARD_FLAT_PERMISSION_FLAG_DEFINITION_METADATA_BUILDERS_BY_KEY,
    ).map((builder) => builder(args));

  let flatPermissionFlagDefinitionMaps = createEmptyFlatEntityMaps();

  for (const definitionMetadata of allPermissionFlagDefinitionMetadatas) {
    flatPermissionFlagDefinitionMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: definitionMetadata,
      flatEntityMaps: flatPermissionFlagDefinitionMaps,
    });
  }

  return flatPermissionFlagDefinitionMaps;
};
