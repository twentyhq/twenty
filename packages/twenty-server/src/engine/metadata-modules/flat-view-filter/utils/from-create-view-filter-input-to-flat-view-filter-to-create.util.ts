import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { getDefaultViewFilterOperand } from 'src/engine/metadata-modules/flat-view-filter/utils/get-default-view-filter-operand.util';
import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';

export const fromCreateViewFilterInputToFlatViewFilterToCreate = ({
  createViewFilterInput: rawCreateViewFilterInput,
  flatApplication,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFilterGroupMaps,
}: {
  createViewFilterInput: CreateViewFilterInput;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatViewMaps' | 'flatViewFilterGroupMaps'
>): UniversalFlatViewFilter & { id: string } => {
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
        'relationTargetFieldMetadataId',
      ],
    );

  const createdAt = new Date().toISOString();
  const viewFilterId = createViewFilterInput.id ?? v4();

  const {
    fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    viewFilterGroupUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'viewFilter',
    foreignKeyValues: {
      fieldMetadataId,
      viewId,
      viewFilterGroupId: createViewFilterInput.viewFilterGroupId,
      relationTargetFieldMetadataId:
        createViewFilterInput.relationTargetFieldMetadataId,
    },
    flatEntityMaps: {
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFilterGroupMaps,
    },
  });

  const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: fieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const relationTargetFieldMetadata = isDefined(
    relationTargetFieldMetadataUniversalIdentifier,
  )
    ? findFlatEntityByUniversalIdentifier({
        universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;
  const operand =
    createViewFilterInput.operand ??
    (isDefined(referencedFieldMetadata)
      ? getDefaultViewFilterOperand({
          fieldType: referencedFieldMetadata.type,
          subFieldName: createViewFilterInput.subFieldName,
          relationTargetFieldType: relationTargetFieldMetadata?.type,
        })
      : undefined) ??
    ViewFilterOperand.CONTAINS;

  return {
    id: viewFilterId,
    fieldMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewFilterInput.universalIdentifier ?? v4(),
    operand,
    value,
    viewFilterGroupUniversalIdentifier,
    positionInViewFilterGroup:
      createViewFilterInput.positionInViewFilterGroup ?? null,
    subFieldName: createViewFilterInput.subFieldName ?? null,
    relationTargetFieldMetadataUniversalIdentifier,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
