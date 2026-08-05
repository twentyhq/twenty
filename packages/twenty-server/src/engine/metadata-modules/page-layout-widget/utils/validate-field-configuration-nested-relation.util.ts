import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
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

const buildNestedRelationValidationException = ({
  message,
  userFriendlyMessage,
  widgetTitle,
}: {
  message: string;
  userFriendlyMessage: MessageDescriptor;
  widgetTitle?: string | null;
}): PageLayoutWidgetException => {
  const prefix = isDefined(widgetTitle) ? `Widget "${widgetTitle}": ` : '';

  return new PageLayoutWidgetException(
    prefix + message,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    { userFriendlyMessage },
  );
};

// Junction relation fields also carry ONE_TO_MANY metadata but are rendered
// through a dedicated junction path, so they are not valid nested hops.
const isPlainOneToManyRelationFlatFieldMetadata = (
  field: FlatFieldMetadata,
): boolean =>
  isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) &&
  field.settings.relationType === RelationType.ONE_TO_MANY &&
  !isNonEmptyString(field.settings.junctionTargetFieldId);

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
    throw buildNestedRelationValidationException({
      message: `fieldMetadataId "${fieldMetadataId}" not found.`,
      userFriendlyMessage: msg`The field configured for this widget could not be found.`,
      widgetTitle,
    });
  }

  if (!isPlainOneToManyRelationFlatFieldMetadata(sourceField)) {
    throw buildNestedRelationValidationException({
      message: `nestedRelationFieldMetadataId requires "${sourceField.label}" to be a one-to-many relation field.`,
      userFriendlyMessage: msg`${sourceField.label} must be a one-to-many relation field.`,
      widgetTitle,
    });
  }

  if (
    isDefined(widgetObjectMetadataId) &&
    sourceField.objectMetadataId !== widgetObjectMetadataId
  ) {
    throw buildNestedRelationValidationException({
      message: `fieldMetadataId "${fieldMetadataId}" does not belong to the widget object.`,
      userFriendlyMessage: msg`${sourceField.label} does not belong to this widget's object.`,
      widgetTitle,
    });
  }

  const nestedField = findActiveFlatFieldMetadataById(
    nestedRelationFieldMetadataId,
    flatFieldMetadataMaps,
  );

  if (!isDefined(nestedField)) {
    throw buildNestedRelationValidationException({
      message: `nestedRelationFieldMetadataId "${nestedRelationFieldMetadataId}" not found.`,
      userFriendlyMessage: msg`The nested relation field configured for this widget could not be found.`,
      widgetTitle,
    });
  }

  if (!isPlainOneToManyRelationFlatFieldMetadata(nestedField)) {
    throw buildNestedRelationValidationException({
      message: `nestedRelationFieldMetadataId "${nestedField.label}" must be a one-to-many relation field.`,
      userFriendlyMessage: msg`${nestedField.label} must be a one-to-many relation field.`,
      widgetTitle,
    });
  }

  if (
    nestedField.objectMetadataId !== sourceField.relationTargetObjectMetadataId
  ) {
    throw buildNestedRelationValidationException({
      message: `nestedRelationFieldMetadataId "${nestedField.label}" does not belong to the relation target of "${sourceField.label}".`,
      userFriendlyMessage: msg`${nestedField.label} does not belong to the object ${sourceField.label} points to.`,
      widgetTitle,
    });
  }
};
