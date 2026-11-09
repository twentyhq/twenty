import { isNull } from '@sniptt/guards';
import { msg, t } from '@lingui/core/macro';
import {
  type PageLayoutFilter,
  PageLayoutType,
  type UniversalDashboardFilterBinding,
} from 'twenty-shared/types';
import {
  getEffectiveDashboardPageLayoutFilters,
  isDefined,
  isFieldBindableToDashboardFilter,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { UNIVERSAL_DASHBOARD_FILTER_BINDINGS_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/constants/universal-dashboard-filter-bindings-schema.constant';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

type DashboardFilterBindingWidget = Pick<
  UniversalFlatPageLayoutWidget,
  | 'title'
  | 'objectMetadataUniversalIdentifier'
  | 'pageLayoutTabUniversalIdentifier'
  | 'universalConfiguration'
  | 'isActive'
  | 'applicationUniversalIdentifier'
  | 'universalOverrides'
>;

const validateDashboardFilterBinding = ({
  binding: { pageLayoutFilterId, fieldMetadataUniversalIdentifier },
  pageLayoutFilter,
  isPageLayoutFilterAlreadyBound,
  widget: { title: widgetTitle, objectMetadataUniversalIdentifier },
  flatFieldMetadataMaps,
}: {
  binding: UniversalDashboardFilterBinding;
  pageLayoutFilter: PageLayoutFilter | undefined;
  isPageLayoutFilterAlreadyBound: boolean;
  widget: DashboardFilterBindingWidget;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(pageLayoutFilter)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget "${widgetTitle}" is bound to dashboard filter "${pageLayoutFilterId}", which does not exist on its dashboard`,
      userFriendlyMessage: msg`A widget is bound to a dashboard filter that does not exist`,
      value: pageLayoutFilterId,
    });
  }

  if (isPageLayoutFilterAlreadyBound) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget "${widgetTitle}" is bound to dashboard filter "${pageLayoutFilterId}" more than once`,
      userFriendlyMessage: msg`A widget can be bound to a dashboard filter only once`,
      value: pageLayoutFilterId,
    });
  }

  if (isNull(fieldMetadataUniversalIdentifier)) {
    return errors;
  }

  const field = findFlatEntityByUniversalIdentifier({
    universalIdentifier: fieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(field)) {
    return [
      ...errors,
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Widget "${widgetTitle}" binds dashboard filter "${pageLayoutFilterId}" to a field that does not exist`,
        userFriendlyMessage: msg`A dashboard filter is bound to a field that does not exist`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const fieldName = field.name;

  if (
    field.objectMetadataUniversalIdentifier !==
    objectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget "${widgetTitle}" binds dashboard filter "${pageLayoutFilterId}" to field "${fieldName}", which does not belong to the widget's object`,
      userFriendlyMessage: msg`A dashboard filter is bound to a field of another object`,
      value: fieldMetadataUniversalIdentifier,
    });
  }

  if (!isDefined(pageLayoutFilter)) {
    return errors;
  }

  const { label: pageLayoutFilterLabel, type: pageLayoutFilterType } =
    pageLayoutFilter;

  if (
    !isFieldBindableToDashboardFilter({
      field,
      filterType: pageLayoutFilterType,
    })
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget "${widgetTitle}" binds dashboard filter "${pageLayoutFilterLabel}" of type ${pageLayoutFilterType} to field "${fieldName}", which is not compatible`,
      userFriendlyMessage: msg`This field cannot be bound to this dashboard filter`,
      value: fieldMetadataUniversalIdentifier,
    });
  }

  return errors;
};

export const validatePageLayoutWidgetDashboardFilterBindings = ({
  widget,
  flatEntityMaps: {
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatFieldMetadataMaps,
  },
}: {
  widget: DashboardFilterBindingWidget;
  flatEntityMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatPageLayoutMaps' | 'flatPageLayoutTabMaps' | 'flatFieldMetadataMaps'
  >;
}): FlatPageLayoutWidgetValidationError[] => {
  const { title: widgetTitle, universalConfiguration } = widget;
  const pageLayoutTabUniversalIdentifier =
    resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'pageLayoutWidget',
      universalFlatEntity: widget,
      property: 'pageLayoutTabUniversalIdentifier',
    });
  const pageLayoutTab = isDefined(pageLayoutTabUniversalIdentifier)
    ? flatPageLayoutTabMaps.byUniversalIdentifier[
        pageLayoutTabUniversalIdentifier
      ]
    : undefined;

  if (
    !resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'pageLayoutWidget',
      universalFlatEntity: widget,
      property: 'isActive',
    }) ||
    (isDefined(pageLayoutTab) &&
      // Tab overrides hold no ids, so universal tabs keep them in `overrides`
      !resolveEffectiveFlatEntityProperty({
        metadataName: 'pageLayoutTab',
        flatEntity: pageLayoutTab,
        property: 'isActive',
      }))
  ) {
    return [];
  }

  const rawBindings =
    'dashboardFilterBindings' in universalConfiguration
      ? universalConfiguration.dashboardFilterBindings
      : undefined;

  if (!isDefined(rawBindings)) {
    return [];
  }

  const parsedBindings =
    UNIVERSAL_DASHBOARD_FILTER_BINDINGS_SCHEMA.safeParse(rawBindings);

  if (!parsedBindings.success) {
    return parsedBindings.error.issues.map(({ path, message: issue }) => {
      const issuePath = path.map(String).join('.');

      return {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: isNonEmptyArray(path)
          ? t`Dashboard filter bindings of widget "${widgetTitle}" are malformed at "${issuePath}": ${issue}`
          : t`Dashboard filter bindings of widget "${widgetTitle}" are malformed: ${issue}`,
        userFriendlyMessage: msg`Dashboard filter bindings are malformed`,
      };
    });
  }

  const bindings = parsedBindings.data;

  if (!isNonEmptyArray(bindings)) {
    return [];
  }

  const pageLayout = isDefined(pageLayoutTab)
    ? flatPageLayoutMaps.byUniversalIdentifier[
        pageLayoutTab.pageLayoutUniversalIdentifier
      ]
    : undefined;

  if (pageLayout?.type !== PageLayoutType.DASHBOARD) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Widget "${widgetTitle}" has dashboard filter bindings but is not on a dashboard`,
        userFriendlyMessage: msg`Only widgets on a dashboard can be bound to dashboard filters`,
      },
    ];
  }

  const pageLayoutFilterById = new Map(
    getEffectiveDashboardPageLayoutFilters(pageLayout.filters).map((filter) => [
      filter.id,
      filter,
    ]),
  );
  const boundPageLayoutFilterIds = bindings.map(
    ({ pageLayoutFilterId }) => pageLayoutFilterId,
  );

  return bindings.flatMap((binding, index) =>
    validateDashboardFilterBinding({
      binding,
      pageLayoutFilter: pageLayoutFilterById.get(binding.pageLayoutFilterId),
      isPageLayoutFilterAlreadyBound:
        boundPageLayoutFilterIds.indexOf(binding.pageLayoutFilterId) !== index,
      widget,
      flatFieldMetadataMaps,
    }),
  );
};
