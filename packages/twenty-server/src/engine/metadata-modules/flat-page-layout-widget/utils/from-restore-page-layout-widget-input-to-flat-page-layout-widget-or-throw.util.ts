import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export type RestorePageLayoutWidgetInput = {
  id: string;
};

export const fromRestorePageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow = ({
  restorePageLayoutWidgetInput,
  flatPageLayoutWidgetMaps,
}: {
  restorePageLayoutWidgetInput: RestorePageLayoutWidgetInput;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutWidget => {
  const { id: pageLayoutWidgetId } = extractAndSanitizeObjectStringFields(
    restorePageLayoutWidgetInput,
    ['id'],
  );

  const existingFlatPageLayoutWidgetToRestore =
    flatPageLayoutWidgetMaps.byId[pageLayoutWidgetId];

  if (!isDefined(existingFlatPageLayoutWidgetToRestore)) {
    throw new PageLayoutWidgetException(
      t`Page layout widget to restore not found`,
      PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
    );
  }

  if (!isDefined(existingFlatPageLayoutWidgetToRestore.deletedAt)) {
    throw new PageLayoutWidgetException(
      t`Page layout widget is not deleted and cannot be restored`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  return {
    ...existingFlatPageLayoutWidgetToRestore,
    deletedAt: null,
  };
};
