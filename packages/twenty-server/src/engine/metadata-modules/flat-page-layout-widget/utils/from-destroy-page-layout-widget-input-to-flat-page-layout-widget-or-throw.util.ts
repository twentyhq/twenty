import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type DestroyPageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/destroy-page-layout-widget.input';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const fromDestroyPageLayoutWidgetInputToFlatPageLayoutWidgetOrThrow = ({
  destroyPageLayoutWidgetInput,
  flatPageLayoutWidgetMaps,
}: {
  destroyPageLayoutWidgetInput: DestroyPageLayoutWidgetInput;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutWidget => {
  const { id: pageLayoutWidgetId } = extractAndSanitizeObjectStringFields(
    destroyPageLayoutWidgetInput,
    ['id'],
  );

  const existingFlatPageLayoutWidgetToDestroy =
    flatPageLayoutWidgetMaps.byId[pageLayoutWidgetId];

  if (!isDefined(existingFlatPageLayoutWidgetToDestroy)) {
    throw new PageLayoutWidgetException(
      t`Page layout widget to destroy not found`,
      PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
    );
  }

  return existingFlatPageLayoutWidgetToDestroy;
};
