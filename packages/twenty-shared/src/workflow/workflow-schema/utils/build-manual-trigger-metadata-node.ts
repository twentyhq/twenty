import { WORKFLOW_TRIGGER_METADATA_LABEL } from '@/workflow/constants/WorkflowTriggerMetadataLabel';
import { WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY } from '@/workflow/constants/WorkflowTriggerMetadataWorkspaceMemberIdKey';
import { WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_LABEL } from '@/workflow/constants/WorkflowTriggerMetadataWorkspaceMemberIdLabel';
import { type Node } from '@/workflow/workflow-schema/types/base-output-schema.type';

export const buildManualTriggerMetadataNode = (): Node => ({
  isLeaf: false,
  type: 'object',
  label: WORKFLOW_TRIGGER_METADATA_LABEL,
  value: {
    [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: {
      isLeaf: true,
      type: 'string',
      label: WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_LABEL,
      value: '',
    },
  },
});
