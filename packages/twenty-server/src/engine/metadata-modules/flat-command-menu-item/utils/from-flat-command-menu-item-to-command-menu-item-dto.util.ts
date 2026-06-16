import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const fromFlatCommandMenuItemToCommandMenuItemDto = (
  flatCommandMenuItem: FlatCommandMenuItem,
): CommandMenuItemDTO => {
  const effectiveFlatCommandMenuItem = {
    ...flatCommandMenuItem,
    ...(flatCommandMenuItem.overrides ?? {}),
  };

  return {
    id: effectiveFlatCommandMenuItem.id,
    workflowVersionId:
      effectiveFlatCommandMenuItem.workflowVersionId ?? undefined,
    frontComponentId:
      effectiveFlatCommandMenuItem.frontComponentId ?? undefined,
    engineComponentKey: effectiveFlatCommandMenuItem.engineComponentKey,
    label: effectiveFlatCommandMenuItem.label,
    icon: effectiveFlatCommandMenuItem.icon ?? undefined,
    shortLabel: effectiveFlatCommandMenuItem.shortLabel ?? undefined,
    position: effectiveFlatCommandMenuItem.position,
    isPinned: effectiveFlatCommandMenuItem.isPinned,
    payload: effectiveFlatCommandMenuItem.payload ?? undefined,
    hotKeys: effectiveFlatCommandMenuItem.hotKeys ?? undefined,
    availabilityType: effectiveFlatCommandMenuItem.availabilityType,
    conditionalAvailabilityExpression:
      effectiveFlatCommandMenuItem.conditionalAvailabilityExpression ??
      undefined,
    availabilityObjectMetadataId:
      effectiveFlatCommandMenuItem.availabilityObjectMetadataId ?? undefined,
    pageLayoutId: effectiveFlatCommandMenuItem.pageLayoutId ?? undefined,
    workspaceId: effectiveFlatCommandMenuItem.workspaceId,
    applicationId: effectiveFlatCommandMenuItem.applicationId ?? undefined,
    isActive: effectiveFlatCommandMenuItem.isActive,
    isSystemSideEffect: effectiveFlatCommandMenuItem.isSystemSideEffect,
    createdAt: new Date(effectiveFlatCommandMenuItem.createdAt),
    updatedAt: new Date(effectiveFlatCommandMenuItem.updatedAt),
  };
};
