import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { isObjectMetadataCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/utils/is-object-metadata-command-menu-item-payload.util';
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
    payload: isObjectMetadataCommandMenuItemPayload(
      effectiveFlatCommandMenuItem.payload,
    )
      ? undefined
      : (effectiveFlatCommandMenuItem.payload ?? undefined),
    hotKeys: effectiveFlatCommandMenuItem.hotKeys ?? undefined,
    availabilityType: effectiveFlatCommandMenuItem.availabilityType,
    conditionalAvailabilityExpression:
      effectiveFlatCommandMenuItem.conditionalAvailabilityExpression ??
      undefined,
    conditionalPinnedExpression:
      effectiveFlatCommandMenuItem.conditionalPinnedExpression ?? undefined,
    availabilityObjectMetadataId:
      effectiveFlatCommandMenuItem.availabilityObjectMetadataId ?? undefined,
    navigationTargetObjectMetadataId:
      effectiveFlatCommandMenuItem.navigationTargetObjectMetadataId ??
      undefined,
    pageLayoutId: effectiveFlatCommandMenuItem.pageLayoutId ?? undefined,
    workspaceId: effectiveFlatCommandMenuItem.workspaceId,
    applicationId: effectiveFlatCommandMenuItem.applicationId ?? undefined,
    isActive: effectiveFlatCommandMenuItem.isActive,
    overrides: flatCommandMenuItem.overrides,
    createdAt: new Date(effectiveFlatCommandMenuItem.createdAt),
    updatedAt: new Date(effectiveFlatCommandMenuItem.updatedAt),
  };
};
