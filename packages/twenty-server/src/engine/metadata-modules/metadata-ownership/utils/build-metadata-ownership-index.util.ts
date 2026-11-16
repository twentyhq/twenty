import { isString, isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OWNABLE_METADATA_BY_ROOT_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/ownable-metadata-by-root-metadata-name.constant';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { type OwnableChildMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-child-metadata-name.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnershipSourceFlatEntityMaps } from 'src/engine/metadata-modules/metadata-ownership/types/ownership-source-flat-entity-maps.type';
import { resolveOwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/utils/resolve-ownable-root-privacy-state.util';

export type BuildMetadataOwnershipIndexArgs<
  TRootMetadataName extends OwnableRootMetadataName,
> = {
  [P in TRootMetadataName]: {
    rootMetadataName: P;
    rootFlatEntityMaps: OwnershipSourceFlatEntityMaps;
    childFlatEntityMapsByMetadataName: Record<
      OwnableChildMetadataName<P>,
      OwnershipSourceFlatEntityMaps
    >;
  };
}[TRootMetadataName];

export const buildMetadataOwnershipIndex = <
  TRootMetadataName extends OwnableRootMetadataName,
>({
  rootMetadataName,
  rootFlatEntityMaps,
  childFlatEntityMapsByMetadataName,
}: BuildMetadataOwnershipIndexArgs<TRootMetadataName>): MetadataOwnershipIndex => {
  const ownerUserWorkspaceIdByPrivateRootId: Partial<
    Record<string, string | null>
  > = {};
  const privateRootIdsByOwnerUserWorkspaceId: Partial<
    Record<string, string[]>
  > = {};
  const ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName: Partial<
    Record<string, Partial<Record<string, string | null>>>
  > = {};
  const rootIds = new Set<string>();

  for (const root of Object.values(rootFlatEntityMaps.byUniversalIdentifier)) {
    if (!isDefined(root)) {
      continue;
    }

    rootIds.add(root.id);

    const { isPrivate, ownerUserWorkspaceId } = resolveOwnableRootPrivacyState({
      rootMetadataName,
      row: root,
    });

    if (!isPrivate) {
      continue;
    }

    ownerUserWorkspaceIdByPrivateRootId[root.id] = ownerUserWorkspaceId;

    if (isDefined(ownerUserWorkspaceId)) {
      (privateRootIdsByOwnerUserWorkspaceId[ownerUserWorkspaceId] ??= []).push(
        root.id,
      );
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

    const ownerUserWorkspaceIdByPrivateChildId =
      (ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName[
        childMetadataName
      ] ??= {});

    for (const child of Object.values(
      childFlatEntityMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(child)) {
        continue;
      }

      const rootId = child[rootIdProperty];

      if (!isString(rootId) || !rootIds.has(rootId)) {
        ownerUserWorkspaceIdByPrivateChildId[child.id] = null;
        continue;
      }

      const rootOwnerUserWorkspaceId =
        ownerUserWorkspaceIdByPrivateRootId[rootId];

      if (!isUndefined(rootOwnerUserWorkspaceId)) {
        ownerUserWorkspaceIdByPrivateChildId[child.id] =
          rootOwnerUserWorkspaceId;
      }
    }
  }

  return {
    ownerUserWorkspaceIdByPrivateRootId,
    privateRootIdsByOwnerUserWorkspaceId,
    ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName,
  };
};
