import { isDefined } from 'twenty-shared/utils';

import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FieldsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/fields-configuration.dto';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateFieldsWidgetNewFieldDefaultConfiguration = ({
  configuration,
  flatViewFieldGroupMaps,
}: {
  configuration: FieldsConfigurationDTO;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
}): void => {
  const { viewId, newFieldDefaultConfiguration } = configuration;

  if (!isDefined(viewId)) {
    return;
  }

  const hasViewFieldGroups = Object.values(
    flatViewFieldGroupMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .some((group) => !isDefined(group.deletedAt) && group.viewId === viewId);

  if (hasViewFieldGroups && !isDefined(newFieldDefaultConfiguration)) {
    throw new PageLayoutWidgetException(
      'Fields widget has view field groups but newFieldDefaultConfiguration is not defined. It must be set when groups exist.',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
