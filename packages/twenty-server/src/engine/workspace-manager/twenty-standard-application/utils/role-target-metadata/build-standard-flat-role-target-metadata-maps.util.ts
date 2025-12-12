import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type AllStandardRoleTargetName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-name.type';
import { type AllStandardRoleTargetTypeName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-role-target-type-name.type';
import { STANDARD_FLAT_ROLE_TARGET_METADATA_BUILDERS } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-target-metadata/create-standard-flat-role-target-metadata.util';
import { type CreateStandardRoleTargetArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-target-metadata/create-standard-role-target-flat-metadata.util';

export const buildStandardFlatRoleTargetMetadataMaps = (
  args: Omit<CreateStandardRoleTargetArgs, 'context'>,
): FlatEntityMaps<FlatRoleTarget> => {
  const allRoleTargetMetadatas: FlatRoleTarget[] = [];

  for (const roleTargetTypeName of Object.keys(
    STANDARD_FLAT_ROLE_TARGET_METADATA_BUILDERS,
  ) as AllStandardRoleTargetTypeName[]) {
    const builders =
      STANDARD_FLAT_ROLE_TARGET_METADATA_BUILDERS[roleTargetTypeName];

    for (const roleTargetName of Object.keys(
      builders,
    ) as AllStandardRoleTargetName<typeof roleTargetTypeName>[]) {
      const builder = builders[roleTargetName];
      const roleTargetMetadata = builder(args);

      if (isDefined(roleTargetMetadata)) {
        allRoleTargetMetadatas.push(roleTargetMetadata);
      }
    }
  }

  let flatRoleTargetMetadataMaps = createEmptyFlatEntityMaps();

  for (const roleTargetMetadata of allRoleTargetMetadatas) {
    flatRoleTargetMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: roleTargetMetadata,
      flatEntityMaps: flatRoleTargetMetadataMaps,
    });
  }

  return flatRoleTargetMetadataMaps;
};
