import { ViewFilterOperand } from 'twenty-shared/types';
import {
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  resolveNullableUniversalIdentifierFromFlatEntityId,
  resolveUniversalIdentifierFromFlatEntityIdOrThrow,
} from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';

export const fromCreateViewFilterInputToFlatViewFilterToCreate = ({
  createViewFilterInput: rawCreateViewFilterInput,
  workspaceId,
  flatApplication,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFilterGroupMaps,
}: {
  createViewFilterInput: CreateViewFilterInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatViewMaps' | 'flatViewFilterGroupMaps'
>): FlatViewFilter => {
  const { fieldMetadataId, viewId, value, ...createViewFilterInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFilterInput,
      [
        'fieldMetadataId',
        'id',
        'viewId',
        'viewFilterGroupId',
        'operand',
        'subFieldName',
      ],
    );

  const createdAt = new Date().toISOString();
  const viewFilterId = createViewFilterInput.id ?? v4();

  const fieldMetadataUniversalIdentifier =
    resolveUniversalIdentifierFromFlatEntityIdOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
      metadataName: 'fieldMetadata',
    });

  const viewUniversalIdentifier =
    resolveUniversalIdentifierFromFlatEntityIdOrThrow({
      flatEntityMaps: flatViewMaps,
      flatEntityId: viewId,
      metadataName: 'view',
    });

  const viewFilterGroupUniversalIdentifier =
    resolveNullableUniversalIdentifierFromFlatEntityId({
      flatEntityMaps: flatViewFilterGroupMaps,
      flatEntityId: createViewFilterInput.viewFilterGroupId,
      metadataName: 'viewFilterGroup',
    });

  return {
    id: viewFilterId,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
    viewId,
    viewUniversalIdentifier,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewFilterInput.universalIdentifier ?? v4(),
    operand: createViewFilterInput.operand ?? ViewFilterOperand.CONTAINS,
    value: value,
    viewFilterGroupId: createViewFilterInput.viewFilterGroupId ?? null,
    viewFilterGroupUniversalIdentifier,
    positionInViewFilterGroup:
      createViewFilterInput.positionInViewFilterGroup ?? null,
    subFieldName: createViewFilterInput.subFieldName ?? null,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
