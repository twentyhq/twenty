import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateFrontComponentHeaderCommandMenuItems = ({
  flatPageLayoutWidget,
  flatCommandMenuItemMaps,
}: {
  flatPageLayoutWidget: UniversalFlatPageLayoutWidget;
  flatCommandMenuItemMaps: MetadataUniversalFlatEntityMaps<'commandMenuItem'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const { universalConfiguration } = flatPageLayoutWidget;

  if (
    universalConfiguration.configurationType !==
    WidgetConfigurationType.FRONT_COMPONENT
  ) {
    return [];
  }

  const commandMenuItemUniversalIdentifiers =
    universalConfiguration.headerCommandMenuItemUniversalIdentifiers ?? [];
  const errors: FlatPageLayoutWidgetValidationError[] = [];
  const uniqueCommandMenuItemUniversalIdentifiers = new Set(
    commandMenuItemUniversalIdentifiers,
  );

  if (
    uniqueCommandMenuItemUniversalIdentifiers.size !==
    commandMenuItemUniversalIdentifiers.length
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget header command menu item references must be unique`,
      userFriendlyMessage: msg`Widget header actions must be unique`,
    });
  }

  for (const commandMenuItemUniversalIdentifier of uniqueCommandMenuItemUniversalIdentifiers) {
    const commandMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier: commandMenuItemUniversalIdentifier,
      flatEntityMaps: flatCommandMenuItemMaps,
    });

    if (!isDefined(commandMenuItem)) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Command menu item ${commandMenuItemUniversalIdentifier} referenced by widget header was not found`,
        userFriendlyMessage: msg`A widget header action was not found`,
        value: commandMenuItemUniversalIdentifier,
      });

      continue;
    }

    if (
      commandMenuItem.applicationUniversalIdentifier !==
      flatPageLayoutWidget.applicationUniversalIdentifier
    ) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Command menu item ${commandMenuItemUniversalIdentifier} referenced by widget header belongs to another application`,
        userFriendlyMessage: msg`Widget header actions must belong to the same application as the widget`,
        value: commandMenuItemUniversalIdentifier,
      });
    }
  }

  return errors;
};
