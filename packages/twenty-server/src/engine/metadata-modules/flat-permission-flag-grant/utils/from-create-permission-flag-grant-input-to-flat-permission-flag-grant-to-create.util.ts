import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreatePermissionFlagGrantInput } from 'src/engine/metadata-modules/permission-flag-grant/dtos/create-permission-flag-grant.input';
import { type UniversalFlatPermissionFlagGrant } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag-grant.type';

export const fromCreatePermissionFlagGrantInputToFlatPermissionFlagGrantToCreate = ({
  createPermissionFlagGrantInput,
  flatApplication,
  flatRoleMaps,
}: {
  createPermissionFlagGrantInput: CreatePermissionFlagGrantInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatRoleMaps'>): UniversalFlatPermissionFlagGrant & {
  id: string;
} => {
  const { roleId, flag, universalIdentifier } = createPermissionFlagGrantInput;
  const now = new Date().toISOString();

  const { roleUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'permissionFlagGrant',
      foreignKeyValues: { roleId },
      flatEntityMaps: { flatRoleMaps },
    },
  );

  return {
    id: v4(),
    flag,
    universalIdentifier: universalIdentifier ?? v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    roleUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
