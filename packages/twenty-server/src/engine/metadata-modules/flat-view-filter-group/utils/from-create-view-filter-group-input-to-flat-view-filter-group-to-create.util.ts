import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  resolveNullableUniversalIdentifierFromFlatEntityId,
  resolveUniversalIdentifierFromFlatEntityIdOrThrow,
} from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

export const fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate = ({
  createViewFilterGroupInput: rawCreateViewFilterGroupInput,
  workspaceId,
  flatApplication,
  flatViewMaps,
  flatViewFilterGroupMaps,
}: {
  createViewFilterGroupInput: CreateViewFilterGroupInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFilterGroupMaps'
>): FlatViewFilterGroup => {
  const { viewId, ...createViewFilterGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFilterGroupInput,
      ['id', 'viewId', 'parentViewFilterGroupId'],
    );

  const createdAt = new Date().toISOString();
  const viewFilterGroupId = createViewFilterGroupInput.id ?? v4();

  const viewUniversalIdentifier =
    resolveUniversalIdentifierFromFlatEntityIdOrThrow({
      flatEntityMaps: flatViewMaps,
      flatEntityId: viewId,
      metadataName: 'view',
    });

  const parentViewFilterGroupUniversalIdentifier =
    resolveNullableUniversalIdentifierFromFlatEntityId({
      flatEntityMaps: flatViewFilterGroupMaps,
      flatEntityId: createViewFilterGroupInput.parentViewFilterGroupId,
      metadataName: 'viewFilterGroup',
    });

  return {
    id: viewFilterGroupId,
    viewId,
    viewUniversalIdentifier,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: viewFilterGroupId,
    logicalOperator:
      createViewFilterGroupInput.logicalOperator ??
      ViewFilterGroupLogicalOperator.AND,
    parentViewFilterGroupId:
      createViewFilterGroupInput.parentViewFilterGroupId ?? null,
    parentViewFilterGroupUniversalIdentifier,
    positionInViewFilterGroup:
      createViewFilterGroupInput.positionInViewFilterGroup ?? null,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    viewFilterIds: [],
    viewFilterUniversalIdentifiers: [],
    childViewFilterGroupIds: [],
    childViewFilterGroupUniversalIdentifiers: [],
  };
};
