import { v4 as uuidv4 } from 'uuid';

import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate = ({
  createCommandMenuItemInput,
  workspaceId,
  applicationId,
}: {
  createCommandMenuItemInput: CreateCommandMenuItemInput;
  workspaceId: string;
  applicationId: string;
}): FlatCommandMenuItem => {
  const id = uuidv4();
  const now = new Date().toISOString();

  return {
    id,
    universalIdentifier: id,
    workflowVersionId: createCommandMenuItemInput.workflowVersionId,
    label: createCommandMenuItemInput.label,
    icon: createCommandMenuItemInput.icon ?? null,
    isPinned: createCommandMenuItemInput.isPinned ?? false,
    availabilityType:
      createCommandMenuItemInput.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL,
    availabilityObjectMetadataId:
      createCommandMenuItemInput.availabilityObjectMetadataId ?? null,
    workspaceId,
    applicationId,
    createdAt: now,
    updatedAt: now,
  };
};
