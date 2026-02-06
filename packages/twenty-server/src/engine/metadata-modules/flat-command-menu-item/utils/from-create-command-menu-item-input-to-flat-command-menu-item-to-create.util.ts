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
import { resolveNullableUniversalIdentifierFromFlatEntityId } from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';

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

  const availabilityObjectMetadataUniversalIdentifier =
    resolveNullableUniversalIdentifierFromFlatEntityId({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: createCommandMenuItemInput.availabilityObjectMetadataId,
      metadataName: 'objectMetadata',
    });

  const frontComponentUniversalIdentifier =
    resolveNullableUniversalIdentifierFromFlatEntityId({
      flatEntityMaps: flatFrontComponentMaps,
      flatEntityId: createCommandMenuItemInput.frontComponentId,
      metadataName: 'frontComponent',
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
