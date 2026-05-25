import { v4 as uuidv4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';

export const fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate = ({
  createCommandMenuItemInput,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
  flatFrontComponentMaps,
  flatPageLayoutMaps,
}: {
  createCommandMenuItemInput: CreateCommandMenuItemInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFrontComponentMaps' | 'flatPageLayoutMaps'
>): FlatCommandMenuItem => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const {
    availabilityObjectMetadataUniversalIdentifier,
    frontComponentUniversalIdentifier,
    pageLayoutUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'commandMenuItem',
    foreignKeyValues: {
      availabilityObjectMetadataId:
        createCommandMenuItemInput.availabilityObjectMetadataId,
      frontComponentId: createCommandMenuItemInput.frontComponentId,
      pageLayoutId: createCommandMenuItemInput.pageLayoutId,
    },
    flatEntityMaps: {
      flatObjectMetadataMaps,
      flatFrontComponentMaps,
      flatPageLayoutMaps,
    },
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
    payload:
      createCommandMenuItemInput.engineComponentKey ===
      EngineComponentKey.NAVIGATION
        ? (createCommandMenuItemInput.payload ?? null)
        : null,
    hotKeys: createCommandMenuItemInput.hotKeys ?? null,
    availabilityType:
      createCommandMenuItemInput.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL,
    availabilityObjectMetadataId:
      createCommandMenuItemInput.availabilityObjectMetadataId ?? null,
    conditionalAvailabilityExpression:
      createCommandMenuItemInput.conditionalAvailabilityExpression ?? null,
    availabilityObjectMetadataUniversalIdentifier,
    pageLayoutId: createCommandMenuItemInput.pageLayoutId ?? null,
    pageLayoutUniversalIdentifier,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
