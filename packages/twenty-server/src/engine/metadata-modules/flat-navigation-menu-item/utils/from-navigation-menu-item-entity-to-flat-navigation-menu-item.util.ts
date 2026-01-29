import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromNavigationMenuItemEntityToFlatNavigationMenuItem = ({
  entity: navigationMenuItemEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  navigationMenuItemIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'navigationMenuItem'>): FlatNavigationMenuItem => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      navigationMenuItemEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${navigationMenuItemEntity.applicationId} not found for navigationMenuItem ${navigationMenuItemEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let targetObjectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(navigationMenuItemEntity.targetObjectMetadataId)) {
    targetObjectMetadataUniversalIdentifier =
      objectMetadataIdToUniversalIdentifierMap.get(
        navigationMenuItemEntity.targetObjectMetadataId,
      ) ?? null;

    if (!isDefined(targetObjectMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ObjectMetadata with id ${navigationMenuItemEntity.targetObjectMetadataId} not found for navigationMenuItem ${navigationMenuItemEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let folderUniversalIdentifier: string | null = null;

  if (isDefined(navigationMenuItemEntity.folderId)) {
    folderUniversalIdentifier =
      navigationMenuItemIdToUniversalIdentifierMap.get(
        navigationMenuItemEntity.folderId,
      ) ?? null;

    if (!isDefined(folderUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `NavigationMenuItem (folder) with id ${navigationMenuItemEntity.folderId} not found for navigationMenuItem ${navigationMenuItemEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let viewUniversalIdentifier: string | null = null;

  if (isDefined(navigationMenuItemEntity.viewId)) {
    viewUniversalIdentifier =
      viewIdToUniversalIdentifierMap.get(navigationMenuItemEntity.viewId) ??
      null;

    if (!isDefined(viewUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `View with id ${navigationMenuItemEntity.viewId} not found for navigationMenuItem ${navigationMenuItemEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  return {
    id: navigationMenuItemEntity.id,
    userWorkspaceId: navigationMenuItemEntity.userWorkspaceId,
    targetRecordId: navigationMenuItemEntity.targetRecordId,
    targetObjectMetadataId: navigationMenuItemEntity.targetObjectMetadataId,
    viewId: navigationMenuItemEntity.viewId,
    folderId: navigationMenuItemEntity.folderId,
    name: navigationMenuItemEntity.name,
    position: navigationMenuItemEntity.position,
    workspaceId: navigationMenuItemEntity.workspaceId,
    universalIdentifier: navigationMenuItemEntity.universalIdentifier,
    applicationId: navigationMenuItemEntity.applicationId,
    createdAt: navigationMenuItemEntity.createdAt.toISOString(),
    updatedAt: navigationMenuItemEntity.updatedAt.toISOString(),
    applicationUniversalIdentifier,
    targetObjectMetadataUniversalIdentifier,
    folderUniversalIdentifier,
    viewUniversalIdentifier,
  };
};
