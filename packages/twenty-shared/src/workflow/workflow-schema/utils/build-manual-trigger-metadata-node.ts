import {
  WORKFLOW_TRIGGER_METADATA_LABEL,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_LABEL,
} from '@/workflow/constants/ManualTriggerMetadata';
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
