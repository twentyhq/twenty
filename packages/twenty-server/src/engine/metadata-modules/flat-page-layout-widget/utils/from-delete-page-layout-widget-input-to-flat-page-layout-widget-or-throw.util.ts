import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type DeletePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/delete-page-layout-widget.input';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const fromDeletePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow = ({
  deletePageLayoutWidgetInput: rawDeletePageLayoutWidgetInput,
  flatPageLayoutWidgetMaps,
}: {
  deletePageLayoutWidgetInput: DeletePageLayoutWidgetInput;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutWidget => {
  const { id: pageLayoutWidgetId } = extractAndSanitizeObjectStringFields(
    rawDeletePageLayoutWidgetInput,
    ['id'],
  );

  const existingFlatPageLayoutWidgetToDelete =
    flatPageLayoutWidgetMaps.byId[pageLayoutWidgetId];

  if (!isDefined(existingFlatPageLayoutWidgetToDelete)) {
    throw new PageLayoutWidgetException(
      t`Page layout widget to delete not found`,
      PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
    );
  }

  return {
    ...existingFlatPageLayoutWidgetToDelete,
    deletedAt: new Date().toISOString(),
  };
};
