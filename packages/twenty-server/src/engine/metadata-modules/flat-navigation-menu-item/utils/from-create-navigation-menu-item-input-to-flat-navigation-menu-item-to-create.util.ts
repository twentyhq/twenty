import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

export const fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate =
  ({
    createNavigationMenuItemInput,
    workspaceId,
    flatApplication,
    flatNavigationMenuItemMaps,
    flatObjectMetadataMaps,
    flatViewMaps,
  }: {
    createNavigationMenuItemInput: CreateNavigationMenuItemInput;
    workspaceId: string;
    flatApplication: FlatApplication;
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatViewMaps'
  >): FlatNavigationMenuItem => {
    const id = uuidv4();
    const now = new Date().toISOString();

    let position = createNavigationMenuItemInput.position;

    if (!isDefined(position)) {
      const userWorkspaceIdKey =
        createNavigationMenuItemInput.userWorkspaceId ?? 'null';
      const folderIdKey = createNavigationMenuItemInput.folderId ?? 'null';

      const existingItems =
        flatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId[
          userWorkspaceIdKey
        ]?.[folderIdKey] ?? [];

      const maxPosition = existingItems.reduce(
        (max, item) => Math.max(max, item.position),
        0,
      );

      position = maxPosition + 1;
    }

    const {
      targetObjectMetadataUniversalIdentifier,
      viewUniversalIdentifier,
      folderUniversalIdentifier,
    } = resolveEntityRelationUniversalIdentifiers({
      metadataName: 'navigationMenuItem',
      foreignKeyValues: {
        targetObjectMetadataId:
          createNavigationMenuItemInput.targetObjectMetadataId,
        viewId: createNavigationMenuItemInput.viewId,
        folderId: createNavigationMenuItemInput.folderId,
      },
      flatEntityMaps: {
        flatObjectMetadataMaps,
        flatViewMaps,
        flatNavigationMenuItemMaps,
      },
    });

    return {
      id,
      universalIdentifier: id,
      userWorkspaceId: createNavigationMenuItemInput.userWorkspaceId ?? null,
      targetRecordId: createNavigationMenuItemInput.targetRecordId ?? null,
      targetObjectMetadataId:
        createNavigationMenuItemInput.targetObjectMetadataId ?? null,
      targetObjectMetadataUniversalIdentifier,
      viewId: createNavigationMenuItemInput.viewId ?? null,
      viewUniversalIdentifier,
      folderId: createNavigationMenuItemInput.folderId ?? null,
      folderUniversalIdentifier,
      name: createNavigationMenuItemInput.name ?? null,
      position,
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };
