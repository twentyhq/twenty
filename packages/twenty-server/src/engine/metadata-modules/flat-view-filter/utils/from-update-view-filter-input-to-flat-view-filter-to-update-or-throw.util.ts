import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  resolveNullableUniversalIdentifierFromFlatEntityId,
  resolveUniversalIdentifierFromFlatEntityIdOrThrow,
} from 'src/engine/metadata-modules/flat-entity/utils/resolve-universal-identifier-from-flat-entity-id-or-throw.util';
import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFilterInputToFlatViewFilterToUpdateOrThrow = ({
  updateViewFilterInput: rawUpdateViewFilterInput,
  flatViewFilterMaps,
  flatFieldMetadataMaps,
  flatViewFilterGroupMaps,
}: {
  updateViewFilterInput: UpdateViewFilterInput;
  flatViewFilterMaps: FlatViewFilterMaps;
} & Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatViewFilterGroupMaps'
>): FlatViewFilter => {
  const { id: viewFilterToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFilterInput,
      ['id'],
    );

  const existingFlatViewFilterToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFilterToUpdateId,
    flatEntityMaps: flatViewFilterMaps,
  });

  if (!isDefined(existingFlatViewFilterToUpdate)) {
    throw new ViewFilterException(
      t`View filter to update not found`,
      ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFilterInput.update,
    FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
  );

  const flatViewFilterToUpdate = mergeUpdateInExistingRecord({
    existing: existingFlatViewFilterToUpdate,
    properties: FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });

  if (updatedEditableFieldProperties.fieldMetadataId !== undefined) {
    flatViewFilterToUpdate.fieldMetadataUniversalIdentifier =
      resolveUniversalIdentifierFromFlatEntityIdOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatViewFilterToUpdate.fieldMetadataId,
        metadataName: 'fieldMetadata',
      });
  }

  if (updatedEditableFieldProperties.viewFilterGroupId !== undefined) {
    flatViewFilterToUpdate.viewFilterGroupUniversalIdentifier =
      resolveNullableUniversalIdentifierFromFlatEntityId({
        flatEntityMaps: flatViewFilterGroupMaps,
        flatEntityId: flatViewFilterToUpdate.viewFilterGroupId,
        metadataName: 'viewFilterGroup',
      });
  }

  return flatViewFilterToUpdate;
};
