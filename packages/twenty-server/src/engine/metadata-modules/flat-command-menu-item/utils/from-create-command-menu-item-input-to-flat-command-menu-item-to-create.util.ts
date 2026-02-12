import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
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
  const hasWorkflowVersionId = isDefined(
    createCommandMenuItemInput.workflowVersionId,
  );
  const hasFrontComponentId = isDefined(
    createCommandMenuItemInput.frontComponentId,
  );

  if (hasWorkflowVersionId === hasFrontComponentId) {
    throw new CommandMenuItemException(
      'Exactly one of workflowVersionId or frontComponentId is required',
      CommandMenuItemExceptionCode.WORKFLOW_OR_FRONT_COMPONENT_REQUIRED,
    );
  }

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
    label: createCommandMenuItemInput.label,
    icon: createCommandMenuItemInput.icon ?? null,
    isPinned: createCommandMenuItemInput.isPinned ?? false,
    availabilityType:
      createCommandMenuItemInput.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL,
    availabilityObjectMetadataId:
      createCommandMenuItemInput.availabilityObjectMetadataId ?? null,
    availabilityObjectMetadataUniversalIdentifier,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
