import { msg, t } from '@lingui/core/macro';
import {
  FieldMetadataType,
  FILTERABLE_FIELD_TYPES,
  RelationType,
  type UniversalDashboardFilterBinding,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

const FILTERABLE_FIELD_TYPE_SET: ReadonlySet<string> = new Set(
  FILTERABLE_FIELD_TYPES,
);

const validateDashboardFilterBinding = ({
  slotId,
  binding,
  widgetTitle,
  widgetObjectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  slotId: string;
  binding: UniversalDashboardFilterBinding;
  widgetTitle: string;
  widgetObjectMetadataUniversalIdentifier: string | null | undefined;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  } = binding;

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" has no field`,
        userFriendlyMessage: msg`A dashboard filter binding has no field`,
        value: slotId,
      },
    ];
  }

  const boundField = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  if (!isDefined(boundField)) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" references a field that does not exist`,
        userFriendlyMessage: msg`A dashboard filter binding references a deleted field`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  if (
    boundField.objectMetadataUniversalIdentifier !==
    widgetObjectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" must use a field of the widget object`,
        userFriendlyMessage: msg`A dashboard filter binding uses a field of another object`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const relationTargetField = isDefined(
    relationTargetFieldMetadataUniversalIdentifier,
  )
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      })
    : undefined;

  if (isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    const isManyToOneRelation =
      boundField.type === FieldMetadataType.RELATION &&
      isDefined(boundField.universalSettings) &&
      'relationType' in boundField.universalSettings &&
      boundField.universalSettings.relationType === RelationType.MANY_TO_ONE;

    if (!isManyToOneRelation) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" sets a relation target field on a field that is not a many-to-one relation`,
          userFriendlyMessage: msg`A dashboard filter binding traverses a field that is not a many-to-one relation`,
          value: fieldMetadataUniversalIdentifier,
        },
      ];
    }

    if (!isDefined(relationTargetField)) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" references a relation target field that does not exist`,
          userFriendlyMessage: msg`A dashboard filter binding references a deleted relation target field`,
          value: relationTargetFieldMetadataUniversalIdentifier,
        },
      ];
    }

    if (
      relationTargetField.objectMetadataUniversalIdentifier !==
      boundField.relationTargetObjectMetadataUniversalIdentifier
    ) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" uses a relation target field that does not belong to the relation target object`,
          userFriendlyMessage: msg`A dashboard filter binding uses a relation target field of the wrong object`,
          value: relationTargetFieldMetadataUniversalIdentifier,
        },
      ];
    }
  }

  const effectiveFieldType = getEffectiveFilterFieldType({
    fieldType: boundField.type,
    relationTargetFieldType: relationTargetField?.type,
  });

  if (!FILTERABLE_FIELD_TYPE_SET.has(effectiveFieldType)) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Dashboard filter binding "${slotId}" of widget "${widgetTitle}" is bound to a field of type ${effectiveFieldType}, which cannot be filtered`,
        userFriendlyMessage: msg`A dashboard filter binding uses a field that cannot be filtered`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  return [];
};

export const validateDashboardFilterBindings = ({
  dashboardFilterBindings,
  widgetTitle,
  widgetObjectMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  dashboardFilterBindings:
    | Record<string, UniversalDashboardFilterBinding | null>
    | undefined;
  widgetTitle: string;
  widgetObjectMetadataUniversalIdentifier: string | null | undefined;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  if (!isDefined(dashboardFilterBindings)) {
    return [];
  }

  return Object.entries(dashboardFilterBindings).flatMap(([slotId, binding]) =>
    // null means the slot is explicitly not applied to this widget
    isDefined(binding)
      ? validateDashboardFilterBinding({
          slotId,
          binding,
          widgetTitle,
          widgetObjectMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        })
      : [],
  );
};
