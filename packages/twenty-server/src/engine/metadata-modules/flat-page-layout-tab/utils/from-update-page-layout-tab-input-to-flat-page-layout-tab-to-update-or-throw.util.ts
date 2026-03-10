import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-tab/constants/flat-page-layout-tab-editable-properties.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type UpdatePageLayoutTabInput } from 'src/engine/metadata-modules/page-layout-tab/dtos/inputs/update-page-layout-tab.input';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutTabInputWithId = {
  id: string;
  update: UpdatePageLayoutTabInput;
};

export const fromUpdatePageLayoutTabInputToFlatPageLayoutTabToUpdateOrThrow = ({
  updatePageLayoutTabInput: rawUpdatePageLayoutTabInput,
  flatPageLayoutTabMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  updatePageLayoutTabInput: UpdatePageLayoutTabInputWithId;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatPageLayoutTab => {
  const { id: pageLayoutTabToUpdateId } = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutTabInput,
    ['id'],
  );

  const existingFlatPageLayoutTabToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: pageLayoutTabToUpdateId,
    flatEntityMaps: flatPageLayoutTabMaps,
  });

  if (!isDefined(existingFlatPageLayoutTabToUpdate)) {
    throw new PageLayoutTabException(
      t`Page layout tab to update not found`,
      PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
    );
  }

  const editableProperties = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutTabInput.update,
    FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES,
  );

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatPageLayoutTabToUpdate.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  });

  const { overrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'pageLayoutTab',
      existingFlatEntity: existingFlatPageLayoutTabToUpdate,
      updatedEditableProperties: editableProperties,
      shouldOverride,
    });

  return {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatPageLayoutTabToUpdate,
      properties: [...FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES],
      update: updatedEditableProperties,
    }),
    overrides,
  } as FlatPageLayoutTab;
};
