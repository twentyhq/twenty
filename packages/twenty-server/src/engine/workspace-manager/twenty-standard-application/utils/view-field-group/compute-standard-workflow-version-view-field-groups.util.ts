import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardWorkflowVersionViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'workflowVersion'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    workflowVersionRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    workflowVersionRecordPageFieldsAdditional:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldGroupName: 'additional',
          name: 'Additional',
          position: 1,
          isVisible: true,
        },
      }),
    workflowVersionRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowVersion',
        context: {
          viewName: 'workflowVersionRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 2,
          isVisible: true,
        },
      }),
  };
};
