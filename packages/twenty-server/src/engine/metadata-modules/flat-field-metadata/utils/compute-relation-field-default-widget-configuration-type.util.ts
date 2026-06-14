import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

// Default record page layouts seed a standalone widget per relation field (see
// compute-flat-default-record-page-layout-to-create.util). These widgets carry
// no fieldMetadataId, so they can only be linked back to their relation field
// by name.
const RELATION_FIELD_NAME_TO_DEFAULT_WIDGET_CONFIGURATION_TYPE: Record<
  string,
  WidgetConfigurationType
> = {
  attachments: WidgetConfigurationType.FILES,
  taskTargets: WidgetConfigurationType.TASKS,
  noteTargets: WidgetConfigurationType.NOTES,
  timelineActivities: WidgetConfigurationType.TIMELINE,
  emails: WidgetConfigurationType.EMAILS,
  calendar: WidgetConfigurationType.CALENDAR,
};

export const computeRelationFieldDefaultWidgetConfigurationType = ({
  type,
  name,
}: Pick<FlatFieldMetadata, 'type' | 'name'>): WidgetConfigurationType | undefined => {
  if (type !== FieldMetadataType.RELATION) {
    return undefined;
  }

  return RELATION_FIELD_NAME_TO_DEFAULT_WIDGET_CONFIGURATION_TYPE[name];
};
