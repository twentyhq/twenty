import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter-group/constants/flat-view-filter-group-editable-properties.constant';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFilterGroupInputToFlatViewFilterGroupToUpdateOrThrow =
  ({
    updateViewFilterGroupInput: rawUpdateViewFilterGroupInput,
    flatViewFilterGroupMaps,
  }: {
    updateViewFilterGroupInput: UpdateViewFilterGroupInput & { id: string };
    flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
  }): UniversalFlatViewFilterGroup => {
    const { id: viewFilterGroupToUpdateId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateViewFilterGroupInput,
        ['id'],
      );

    const existingFlatViewFilterGroupToUpdate =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: viewFilterGroupToUpdateId,
        flatEntityMaps: flatViewFilterGroupMaps,
      });

    if (!isDefined(existingFlatViewFilterGroupToUpdate)) {
      throw new ViewFilterGroupException(
        'View filter group not found',
        ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
      );
    }

    const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
      rawUpdateViewFilterGroupInput,
      FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES,
    );

    const flatViewFilterGroupToUpdate = mergeUpdateInExistingRecord({
      existing: existingFlatViewFilterGroupToUpdate,
      properties: FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES,
      update: updatedEditableFieldProperties,
    });

    if (updatedEditableFieldProperties.parentViewFilterGroupId !== undefined) {
      const { parentViewFilterGroupUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewFilterGroup',
          foreignKeyValues: {
            parentViewFilterGroupId:
              flatViewFilterGroupToUpdate.parentViewFilterGroupId,
          },
          flatEntityMaps: { flatViewFilterGroupMaps },
        });

      flatViewFilterGroupToUpdate.parentViewFilterGroupUniversalIdentifier =
        parentViewFilterGroupUniversalIdentifier;
    }

    return flatViewFilterGroupToUpdate;
  };
