import { msg, t } from '@lingui/core/macro';
import { BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  type UniversalDashboardFilterBinding,
} from 'twenty-shared/types';
import {
  getFilterTypeFromFieldType,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { UNIVERSAL_DASHBOARD_FILTER_BINDINGS_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/constants/universal-dashboard-filter-bindings-schema.constant';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

type DashboardFilterBindingWidget = Pick<
  UniversalFlatPageLayoutWidget,
  'title' | 'objectMetadataUniversalIdentifier'
> & { universalConfiguration: object };

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

  const field = isDefined(fieldMetadataUniversalIdentifier)
    ? findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

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

  const fieldFilterType = getFilterTypeFromFieldType(field.type);
  const { label: pageLayoutFilterLabel, type: pageLayoutFilterType } =
    pageLayoutFilter;

  const isFieldBindable =
    BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE[
      pageLayoutFilterType
    ].some(
      (bindableFieldFilterType) => bindableFieldFilterType === fieldFilterType,
    );

  if (!isFieldBindable) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Widget "${widgetTitle}" binds dashboard filter "${pageLayoutFilterLabel}" of type ${pageLayoutFilterType} to field "${fieldName}", whose filter type ${fieldFilterType} is not compatible`,
      userFriendlyMessage: msg`This field cannot be bound to this dashboard filter`,
      value: fieldMetadataUniversalIdentifier,
    });
  }

  return errors;
};

export const validatePageLayoutWidgetDashboardFilterBindings = ({
  widget,
  pageLayout,
  flatFieldMetadataMaps,
}: {
  widget: DashboardFilterBindingWidget;
  pageLayout: Pick<UniversalFlatPageLayout, 'type' | 'filters'> | undefined;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const { title: widgetTitle, universalConfiguration } = widget;

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
    (pageLayout.filters ?? []).map((filter) => [filter.id, filter]),
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
