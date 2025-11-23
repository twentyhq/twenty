import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type RoleTargetForeignKeyProperties } from 'src/engine/metadata-modules/flat-role-target/types/role-target-foreign-key-properties.type';

type FindAllFlatRoleTargetOfArgs = {
  targetMetadataForeignKey: RoleTargetForeignKeyProperties;
  targetId: string;
} & Pick<AllFlatEntityMaps, 'flatRoleTargetMaps'>;
export const findFlatRoleTargetFromForeignKey = ({
  flatRoleTargetMaps,
  targetMetadataForeignKey,
  targetId,
}: FindAllFlatRoleTargetOfArgs): FlatRoleTarget | undefined => {
  const allRoleTargets = Object.values(flatRoleTargetMaps.byId).filter(
    isDefined,
  );

  return allRoleTargets.find(
    (roleTarget) => roleTarget[targetMetadataForeignKey] === targetId,
  );
};
