import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

export const fromCreateCommandMenuItemInputToFlatCommandMenuItemToCreate = ({
  createCommandMenuItemInput,
  flatApplication,
  flatObjectMetadataMaps,
  flatFrontComponentMaps,
}: {
  createCommandMenuItemInput: CreateCommandMenuItemInput;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFrontComponentMaps'
>): UniversalFlatCommandMenuItem => {
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
    universalIdentifier: uuidv4(),
    workflowVersionId: createCommandMenuItemInput.workflowVersionId ?? null,
    frontComponentUniversalIdentifier,
    label: createCommandMenuItemInput.label,
    icon: createCommandMenuItemInput.icon ?? null,
    isPinned: createCommandMenuItemInput.isPinned ?? false,
    availabilityType:
      createCommandMenuItemInput.availabilityType ??
      CommandMenuItemAvailabilityType.GLOBAL,
    availabilityObjectMetadataUniversalIdentifier,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
