import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreateRolePermissionFlagInput } from 'src/engine/metadata-modules/role-permission-flag/dtos/create-role-permission-flag.input';
import { type UniversalFlatRolePermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-permission-flag.type';

export const fromCreateRolePermissionFlagInputToFlatRolePermissionFlagToCreate =
  ({
    createRolePermissionFlagInput,
    flatApplication,
    flatPermissionFlagMaps,
    flatRoleMaps,
  }: {
    createRolePermissionFlagInput: CreateRolePermissionFlagInput;
    flatApplication: FlatApplication;
  } & Pick<
    AllFlatEntityMaps,
    'flatPermissionFlagMaps' | 'flatRoleMaps'
  >): UniversalFlatRolePermissionFlag & {
    id: string;
  } => {
    const { roleId, permissionFlagId, universalIdentifier } =
      createRolePermissionFlagInput;
    const now = new Date().toISOString();

    const { permissionFlagUniversalIdentifier, roleUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'rolePermissionFlag',
        foreignKeyValues: { permissionFlagId, roleId },
        flatEntityMaps: { flatPermissionFlagMaps, flatRoleMaps },
      });

    return {
      id: v4(),
      universalIdentifier: universalIdentifier ?? v4(),
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      permissionFlagUniversalIdentifier,
      roleUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };
