import { v4 as uuidv4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';

export const fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate = ({
  createCommandMenuItemInput,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
  flatFrontComponentMaps,
}: {
  createCommandMenuItemInput: CreateCommandMenuItemInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFrontComponentMaps'
>): FlatCommandMenuItem => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const {
    availabilityObjectMetadataUniversalIdentifier,
    frontComponentUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'commandMenuItem',
    foreignKeyValues: {
      availabilityObjectMetadataId:
        createCommandMenuItemInput.availabilityObjectMetadataId,
      frontComponentId: createCommandMenuItemInput.frontComponentId,
    },
    flatEntityMaps: { flatObjectMetadataMaps, flatFrontComponentMaps },
  });

  return {
    id,
    universalIdentifier: id,
    workflowVersionId: createCommandMenuItemInput.workflowVersionId ?? null,
    frontComponentId: createCommandMenuItemInput.frontComponentId ?? null,
    frontComponentUniversalIdentifier,
    engineComponentKey: createCommandMenuItemInput.engineComponentKey,
    label: createCommandMenuItemInput.label,
    icon: createCommandMenuItemInput.icon ?? null,
    shortLabel: createCommandMenuItemInput.shortLabel ?? null,
    position: createCommandMenuItemInput.position ?? 0,
    isPinned: createCommandMenuItemInput.isPinned ?? false,
    hotKeys: createCommandMenuItemInput.hotKeys ?? null,
    availabilityType:
      createCommandMenuItemInput.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL,
    availabilityObjectMetadataId:
      createCommandMenuItemInput.availabilityObjectMetadataId ?? null,
    conditionalAvailabilityExpression:
      createCommandMenuItemInput.conditionalAvailabilityExpression ?? null,
    availabilityObjectMetadataUniversalIdentifier,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
