import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardWorkflowRunViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'workflowRun'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    workflowRunRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowRun',
        context: {
          viewName: 'workflowRunRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    workflowRunRecordPageFieldsSystem: createStandardViewFieldGroupFlatMetadata(
      {
        ...args,
        objectName: 'workflowRun',
        context: {
          viewName: 'workflowRunRecordPageFields',
          viewFieldGroupName: 'system',
          name: 'System',
          position: 1,
          isVisible: true,
        },
      },
    ),
  };
};
