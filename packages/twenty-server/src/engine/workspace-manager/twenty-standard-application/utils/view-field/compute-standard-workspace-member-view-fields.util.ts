import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardWorkspaceMemberViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'workspaceMember'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allWorkspaceMembersName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workspaceMember',
      context: {
        viewName: 'allWorkspaceMembers',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allWorkspaceMembersCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workspaceMember',
      context: {
        viewName: 'allWorkspaceMembers',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkspaceMembersOwnedOpportunities: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workspaceMember',
      context: {
        viewName: 'allWorkspaceMembers',
        viewFieldName: 'ownedOpportunities',
        fieldName: 'ownedOpportunities',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allWorkspaceMembersAssignedTasks: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'workspaceMember',
      context: {
        viewName: 'allWorkspaceMembers',
        viewFieldName: 'assignedTasks',
        fieldName: 'assignedTasks',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
