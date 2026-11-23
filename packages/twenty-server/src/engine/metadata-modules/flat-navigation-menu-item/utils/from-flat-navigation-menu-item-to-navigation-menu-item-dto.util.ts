import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type NavigationMenuItemDTO } from 'src/engine/metadata-modules/navigation-menu-item/dtos/navigation-menu-item.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const fromFlatNavigationMenuItemToNavigationMenuItemDto = (
  flatNavigationMenuItem: FlatNavigationMenuItem,
): NavigationMenuItemDTO => {
  const effectiveFlatNavigationMenuItem = resolveEffectiveFlatEntity({
    metadataName: 'navigationMenuItem',
    flatEntity: flatNavigationMenuItem,
  });

  return {
    id: effectiveFlatNavigationMenuItem.id,
    type: effectiveFlatNavigationMenuItem.type,
    userWorkspaceId:
      effectiveFlatNavigationMenuItem.userWorkspaceId ?? undefined,
    targetRecordId: effectiveFlatNavigationMenuItem.targetRecordId ?? undefined,
    targetObjectMetadataId:
      effectiveFlatNavigationMenuItem.targetObjectMetadataId ?? undefined,
    viewId: effectiveFlatNavigationMenuItem.viewId ?? undefined,
    parentId: effectiveFlatNavigationMenuItem.parentId ?? undefined,
    // TODO(@thomtrp): remove with the deprecated folderId GraphQL alias
    folderId: effectiveFlatNavigationMenuItem.parentId ?? undefined,
    name: effectiveFlatNavigationMenuItem.name ?? undefined,
    link: effectiveFlatNavigationMenuItem.link ?? undefined,
    icon: effectiveFlatNavigationMenuItem.icon ?? undefined,
    color: effectiveFlatNavigationMenuItem.color ?? undefined,
    pageLayoutId: effectiveFlatNavigationMenuItem.pageLayoutId ?? undefined,
    agentChatChannelId:
      effectiveFlatNavigationMenuItem.agentChatChannelId ?? undefined,
    nativePageKey: effectiveFlatNavigationMenuItem.nativePageKey ?? undefined,
    builtInSectionKey:
      effectiveFlatNavigationMenuItem.builtInSectionKey ?? undefined,
    workflowId: effectiveFlatNavigationMenuItem.workflowId ?? undefined,
    agentId: effectiveFlatNavigationMenuItem.agentId ?? undefined,
    position: effectiveFlatNavigationMenuItem.position,
    workspaceId: effectiveFlatNavigationMenuItem.workspaceId,
    applicationId: effectiveFlatNavigationMenuItem.applicationId ?? undefined,
    universalIdentifier: effectiveFlatNavigationMenuItem.universalIdentifier,
    isActive: effectiveFlatNavigationMenuItem.isActive !== false,
    createdAt: new Date(effectiveFlatNavigationMenuItem.createdAt),
    updatedAt: new Date(effectiveFlatNavigationMenuItem.updatedAt),
  };
};
