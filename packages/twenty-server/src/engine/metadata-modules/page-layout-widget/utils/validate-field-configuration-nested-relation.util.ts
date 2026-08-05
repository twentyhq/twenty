import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';

const buildNestedRelationValidationException = (
  message: string,
  widgetTitle?: string | null,
): PageLayoutWidgetException => {
  const prefix = isDefined(widgetTitle) ? `Widget "${widgetTitle}": ` : '';
  const fullMessage = prefix + message;

  return new PageLayoutWidgetException(
    fullMessage,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    {
      userFriendlyMessage: msg`${fullMessage}`,
    },
  );
};

const isOneToManyRelationFlatFieldMetadata = (
  field: FlatFieldMetadata,
): boolean =>
  isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) &&
  field.settings.relationType === RelationType.ONE_TO_MANY;

export const validateFieldConfigurationNestedRelationOrThrow = ({
  widgetConfiguration,
  widgetObjectMetadataId,
  widgetTitle,
  flatFieldMetadataMaps,
}: {
  widgetConfiguration?: AllPageLayoutWidgetConfiguration | null;
  widgetObjectMetadataId?: string | null;
  widgetTitle?: string | null;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  if (
    !isDefined(widgetConfiguration) ||
    widgetConfiguration.configurationType !== WidgetConfigurationType.FIELD
  ) {
    return;
  }

  const { fieldMetadataId, nestedRelationFieldMetadataId } =
    widgetConfiguration;

  if (!isDefined(nestedRelationFieldMetadataId)) {
    return;
  }

  const sourceField = findActiveFlatFieldMetadataById(
    fieldMetadataId,
    flatFieldMetadataMaps,
  );

  if (!isDefined(sourceField)) {
    throw buildNestedRelationValidationException(
      `fieldMetadataId "${fieldMetadataId}" not found.`,
      widgetTitle,
    );
  }

  if (!isOneToManyRelationFlatFieldMetadata(sourceField)) {
    throw buildNestedRelationValidationException(
      `nestedRelationFieldMetadataId requires "${sourceField.label}" to be a one-to-many relation field.`,
      widgetTitle,
    );
  }

  if (
    isDefined(widgetObjectMetadataId) &&
    sourceField.objectMetadataId !== widgetObjectMetadataId
  ) {
    throw buildNestedRelationValidationException(
      `fieldMetadataId "${fieldMetadataId}" does not belong to the widget object.`,
      widgetTitle,
    );
  }

  const nestedField = findActiveFlatFieldMetadataById(
    nestedRelationFieldMetadataId,
    flatFieldMetadataMaps,
  );

  if (!isDefined(nestedField)) {
    throw buildNestedRelationValidationException(
      `nestedRelationFieldMetadataId "${nestedRelationFieldMetadataId}" not found.`,
      widgetTitle,
    );
  }

  if (!isOneToManyRelationFlatFieldMetadata(nestedField)) {
    throw buildNestedRelationValidationException(
      `nestedRelationFieldMetadataId "${nestedField.label}" must be a one-to-many relation field.`,
      widgetTitle,
    );
  }

  if (
    nestedField.objectMetadataId !== sourceField.relationTargetObjectMetadataId
  ) {
    throw buildNestedRelationValidationException(
      `nestedRelationFieldMetadataId "${nestedField.label}" does not belong to the relation target of "${sourceField.label}".`,
      widgetTitle,
    );
  }
};
