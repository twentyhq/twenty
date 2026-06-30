import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-flat-role-metadata.util';
import { type CreateStandardRoleArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-role-flat-metadata.util';

export const buildStandardFlatRoleMetadataMaps = (
  args: Omit<CreateStandardRoleArgs, 'context'>,
): FlatEntityMaps<FlatRole> => {
  const allRoleMetadatas: FlatRole[] = Object.values(
    STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME,
  ).map((builder) => builder(args));

  let flatRoleMetadataMaps = createEmptyFlatEntityMaps();

  for (const roleMetadata of allRoleMetadatas) {
    flatRoleMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: roleMetadata,
      flatEntityMaps: flatRoleMetadataMaps,
    });
  }

  return flatRoleMetadataMaps;
};
