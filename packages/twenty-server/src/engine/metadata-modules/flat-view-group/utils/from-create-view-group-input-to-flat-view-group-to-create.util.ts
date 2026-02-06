import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveUniversalIdentifierFromFlatEntityIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

export const fromCreateViewGroupInputToFlatViewGroupToCreate = ({
  createViewGroupInput: rawCreateViewGroupInput,
  workspaceId,
  flatApplication,
  flatViewMaps,
}: {
  createViewGroupInput: CreateViewGroupInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatViewMaps'>): FlatViewGroup => {
  const { viewId, ...createViewGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewGroupInput,
      ['fieldValue', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewGroupId = createViewGroupInput.id ?? v4();

  const viewUniversalIdentifier =
    resolveUniversalIdentifierFromFlatEntityIdOrThrow({
      flatEntityMaps: flatViewMaps,
      flatEntityId: viewId,
      metadataName: 'view',
    });

  return {
    id: viewGroupId,
    viewId,
    viewUniversalIdentifier,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewGroupInput.universalIdentifier ?? v4(),
    isVisible: createViewGroupInput.isVisible ?? true,
    fieldValue: createViewGroupInput.fieldValue,
    position: createViewGroupInput.position ?? 0,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
