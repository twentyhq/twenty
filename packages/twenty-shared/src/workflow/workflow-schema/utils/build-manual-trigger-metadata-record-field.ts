import { FieldMetadataType } from '@/types/FieldMetadataType';
import { WORKFLOW_TRIGGER_METADATA_KEY } from '@/workflow/constants/WorkflowTriggerMetadataKey';
import { WORKFLOW_TRIGGER_METADATA_LABEL } from '@/workflow/constants/WorkflowTriggerMetadataLabel';
import { WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY } from '@/workflow/constants/WorkflowTriggerMetadataWorkspaceMemberIdKey';
import { WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_LABEL } from '@/workflow/constants/WorkflowTriggerMetadataWorkspaceMemberIdLabel';
import { type RecordFieldNode } from '@/workflow/workflow-schema/types/output-schema.type';

export const buildManualTriggerMetadataRecordField = (): RecordFieldNode => ({
  isLeaf: false,
  type: FieldMetadataType.RAW_JSON,
  label: WORKFLOW_TRIGGER_METADATA_LABEL,
  fieldMetadataId: WORKFLOW_TRIGGER_METADATA_KEY,
  value: {
    [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: {
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_LABEL,
      value: '',
      fieldMetadataId: WORKFLOW_TRIGGER_METADATA_KEY,
      isCompositeSubField: true,
    },
  },
});
