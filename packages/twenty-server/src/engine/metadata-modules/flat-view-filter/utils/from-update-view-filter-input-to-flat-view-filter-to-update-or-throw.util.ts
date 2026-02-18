import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';
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
>): UniversalFlatViewFilter => {
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
    const { fieldMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewFilter',
        foreignKeyValues: {
          fieldMetadataId: flatViewFilterToUpdate.fieldMetadataId,
        },
        flatEntityMaps: { flatFieldMetadataMaps },
      });

    flatViewFilterToUpdate.fieldMetadataUniversalIdentifier =
      fieldMetadataUniversalIdentifier;
  }

  if (updatedEditableFieldProperties.viewFilterGroupId !== undefined) {
    const { viewFilterGroupUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewFilter',
        foreignKeyValues: {
          viewFilterGroupId: flatViewFilterToUpdate.viewFilterGroupId,
        },
        flatEntityMaps: { flatViewFilterGroupMaps },
      });

    flatViewFilterToUpdate.viewFilterGroupUniversalIdentifier =
      viewFilterGroupUniversalIdentifier;
  }

  return flatViewFilterToUpdate;
};
