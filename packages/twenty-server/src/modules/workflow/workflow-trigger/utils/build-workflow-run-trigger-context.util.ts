import {
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
} from 'twenty-shared/workflow';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildWorkflowRunTriggerContext = ({
  workspaceMember,
  payload,
}: {
  workspaceMember: Pick<WorkspaceMemberWorkspaceEntity, 'id' | 'name'>;
  payload?: object | null;
}) => ({
  payload: {
    ...payload,
    [WORKFLOW_TRIGGER_PAYLOAD_KEY]: { ...payload },
    [WORKFLOW_TRIGGER_METADATA_KEY]: {
      [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: workspaceMember.id,
    },
  },
  createdBy: buildCreatedByFromFullNameMetadata({
    fullNameMetadata: {
      firstName: workspaceMember.name.firstName,
      lastName: workspaceMember.name.lastName,
    },
    workspaceMemberId: workspaceMember.id,
  }),
});
