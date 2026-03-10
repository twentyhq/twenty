import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardCalendarChannelEventAssociationViewFieldGroups = (
  args: Omit<
    CreateStandardViewFieldGroupArgs<'calendarChannelEventAssociation'>,
    'context'
  >,
): Record<string, FlatViewFieldGroup> => {
  return {
    calendarChannelEventAssociationRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    calendarChannelEventAssociationRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'calendarChannelEventAssociation',
        context: {
          viewName: 'calendarChannelEventAssociationRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
