import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

// Standalone rich text has no field reference, so it only makes sense on dashboards;
// record pages render rich text through a field-backed widget instead.
export const validateStandaloneRichTextPageLayoutType = ({
  flatEntityToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatPageLayoutTabMaps,
    flatPageLayoutMaps,
  },
}: Pick<
  GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs,
  'flatEntityToValidate' | 'optimisticFlatEntityMapsAndRelatedFlatEntityMaps'
>): FlatPageLayoutWidgetValidationError[] => {
  const pageLayoutTabUniversalIdentifier =
    flatEntityToValidate.universalOverrides?.pageLayoutTabUniversalIdentifier ??
    flatEntityToValidate.pageLayoutTabUniversalIdentifier;

  const referencedPageLayoutTab = findFlatEntityByUniversalIdentifier({
    universalIdentifier: pageLayoutTabUniversalIdentifier,
    flatEntityMaps: flatPageLayoutTabMaps,
  });

  if (!isDefined(referencedPageLayoutTab)) {
    return [];
  }

  const referencedPageLayout = findFlatEntityByUniversalIdentifier({
    universalIdentifier: referencedPageLayoutTab.pageLayoutUniversalIdentifier,
    flatEntityMaps: flatPageLayoutMaps,
  });

  if (!isDefined(referencedPageLayout)) {
    return [];
  }

  if (referencedPageLayout.type === PageLayoutType.DASHBOARD) {
    return [];
  }

  return [
    {
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Standalone rich text widgets are only supported on dashboards`,
      userFriendlyMessage: msg`Rich text widgets can only be added to dashboards`,
      value: referencedPageLayout.type,
    },
  ];
};
