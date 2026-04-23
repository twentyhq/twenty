import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const RELATION_NAME_TO_WIDGET_CONFIGURATION_TYPE: Record<
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

export const computeRelationWidgetConfigurationType = ({
  relationTargetFieldMetadataName,
}: {
  relationTargetFieldMetadataName: string;
}): WidgetConfigurationType | undefined => {
  return RELATION_NAME_TO_WIDGET_CONFIGURATION_TYPE[
    relationTargetFieldMetadataName
  ];
};

export const isRelationFieldWithDefaultPageLayoutWidget = ({
  fieldMetadataType,
  name,
}: {
  fieldMetadataType: FieldMetadataType;
  name: string;
}): boolean => {
  if (fieldMetadataType !== FieldMetadataType.RELATION) {
    return false;
  }

  return isDefined(RELATION_NAME_TO_WIDGET_CONFIGURATION_TYPE[name]);
};
