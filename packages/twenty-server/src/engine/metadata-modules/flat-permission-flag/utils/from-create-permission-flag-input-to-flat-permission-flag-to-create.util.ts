import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';
import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';

export const fromCreatePermissionFlagInputToFlatPermissionFlagToCreate = ({
  createPermissionFlagInput,
  flatApplication,
  flatRoleMaps,
}: {
  createPermissionFlagInput: CreatePermissionFlagInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatRoleMaps'>): UniversalFlatPermissionFlag & {
  id: string;
} => {
  const { roleId, flag, universalIdentifier } = createPermissionFlagInput;
  const now = new Date().toISOString();

  const { roleUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'permissionFlag',
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
