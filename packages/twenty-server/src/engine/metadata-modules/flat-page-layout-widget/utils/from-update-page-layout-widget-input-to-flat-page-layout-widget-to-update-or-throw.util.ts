import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/flat-page-layout-widget-editable-properties.constant';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutWidgetInputWithId = {
  id: string;
  update: UpdatePageLayoutWidgetInput;
};

export const fromUpdatePageLayoutWidgetInputToFlatPageLayoutWidgetToUpdateOrThrow =
  ({
    updatePageLayoutWidgetInput: rawUpdatePageLayoutWidgetInput,
    flatPageLayoutWidgetMaps,
  }: {
    updatePageLayoutWidgetInput: UpdatePageLayoutWidgetInputWithId;
    flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  }): FlatPageLayoutWidget => {
    const { id: pageLayoutWidgetToUpdateId } =
      extractAndSanitizeObjectStringFields(rawUpdatePageLayoutWidgetInput, [
        'id',
      ]);

    const existingFlatPageLayoutWidgetToUpdate =
      flatPageLayoutWidgetMaps.byId[pageLayoutWidgetToUpdateId];

    if (!isDefined(existingFlatPageLayoutWidgetToUpdate)) {
      throw new PageLayoutWidgetException(
        t`Page layout widget to update not found`,
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
      rawUpdatePageLayoutWidgetInput.update,
      FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
    );

    return mergeUpdateInExistingRecord({
      existing: existingFlatPageLayoutWidgetToUpdate,
      properties: FLAT_PAGE_LAYOUT_WIDGET_EDITABLE_PROPERTIES,
      update: updatedEditableFieldProperties,
    });
  };
