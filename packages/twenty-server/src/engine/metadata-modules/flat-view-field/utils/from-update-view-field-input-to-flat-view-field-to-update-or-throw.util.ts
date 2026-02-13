import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow = ({
  updateViewFieldInput: rawUpdateViewFieldInput,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
}: {
  updateViewFieldInput: UpdateViewFieldInput;
  flatViewFieldMaps: FlatViewFieldMaps;
} & Pick<
  AllFlatEntityMaps,
  'flatViewFieldGroupMaps'
>): UniversalFlatViewField => {
  const { id: viewFieldToUpdateId } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateViewFieldInput,
      ['id'],
    );

  const existingFlatViewFieldToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: viewFieldToUpdateId,
    flatEntityMaps: flatViewFieldMaps,
  });

  if (!isDefined(existingFlatViewFieldToUpdate)) {
    throw new ViewFieldException(
      t`View field to update not found`,
      ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdateViewFieldInput.update,
    FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
  );

  const flatViewFieldToUpdate = mergeUpdateInExistingRecord({
    existing: existingFlatViewFieldToUpdate,
    properties: FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });

  if (updatedEditableFieldProperties.viewFieldGroupId !== undefined) {
    const { viewFieldGroupUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'viewField',
        foreignKeyValues: {
          viewFieldGroupId: flatViewFieldToUpdate.viewFieldGroupId,
        },
        flatEntityMaps: { flatViewFieldGroupMaps },
      });

    flatViewFieldToUpdate.viewFieldGroupUniversalIdentifier =
      viewFieldGroupUniversalIdentifier;
  }

  return flatViewFieldToUpdate;
};
