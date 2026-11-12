import { isString, isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { type OwnableChildMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-child-metadata-name.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnershipSourceFlatEntityMaps } from 'src/engine/metadata-modules/metadata-ownership/types/ownership-source-flat-entity-maps.type';
import { getOwnableRootOwnerUserWorkspaceId } from 'src/engine/metadata-modules/metadata-ownership/utils/get-ownable-root-owner-user-workspace-id.util';
import { isOwnableRootPrivate } from 'src/engine/metadata-modules/metadata-ownership/utils/is-ownable-root-private.util';

export type BuildMetadataOwnershipIndexArgs = {
  [P in OwnableRootMetadataName]: {
    rootMetadataName: P;
    rootFlatEntityMaps: OwnershipSourceFlatEntityMaps;
    childFlatEntityMapsByMetadataName: Record<
      OwnableChildMetadataName<P>,
      OwnershipSourceFlatEntityMaps
    >;
  };
}[OwnableRootMetadataName];

export const buildMetadataOwnershipIndex = ({
  rootMetadataName,
  rootFlatEntityMaps,
  childFlatEntityMapsByMetadataName,
}: BuildMetadataOwnershipIndexArgs): MetadataOwnershipIndex => {
  const metadataOwnershipIndex: MetadataOwnershipIndex = {
    ownerUserWorkspaceIdByPrivateRootId: {},
    privateRootIdsByOwnerUserWorkspaceId: {},
    ownerUserWorkspaceIdByPrivateChildId: {},
  };
  const rootIds = new Set<string>();

  for (const root of Object.values(rootFlatEntityMaps.byUniversalIdentifier)) {
    if (!isDefined(root)) {
      continue;
    }

    rootIds.add(root.id);

    if (!isOwnableRootPrivate({ rootMetadataName, row: root })) {
      continue;
    }

    const ownerUserWorkspaceId = getOwnableRootOwnerUserWorkspaceId({
      rootMetadataName,
      row: root,
    });

    metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateRootId[root.id] =
      ownerUserWorkspaceId;

    if (isDefined(ownerUserWorkspaceId)) {
      (metadataOwnershipIndex.privateRootIdsByOwnerUserWorkspaceId[
        ownerUserWorkspaceId
      ] ??= []).push(root.id);
    }
  }

  const childFlatEntityMapsByName: Partial<
    Record<string, OwnershipSourceFlatEntityMaps>
  > = childFlatEntityMapsByMetadataName;

  for (const [childMetadataName, { rootIdProperty }] of Object.entries(
    OWNABLE_METADATA_BY_ROOT_METADATA_NAME[rootMetadataName].children,
  )) {
    const childFlatEntityMaps = childFlatEntityMapsByName[childMetadataName];

    if (!isDefined(childFlatEntityMaps)) {
      continue;
    }

    for (const child of Object.values(
      childFlatEntityMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(child)) {
        continue;
      }

      const rootId = child[rootIdProperty];

      if (!isString(rootId) || !rootIds.has(rootId)) {
        metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId[child.id] =
          null;
        continue;
      }

      const rootOwnerUserWorkspaceId =
        metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateRootId[rootId];

      if (!isUndefined(rootOwnerUserWorkspaceId)) {
        metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId[child.id] =
          rootOwnerUserWorkspaceId;
      }
    }
  }

  return metadataOwnershipIndex;
};
