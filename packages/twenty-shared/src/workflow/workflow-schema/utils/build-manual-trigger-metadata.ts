import { FieldMetadataType } from '@/types/FieldMetadataType';
import {
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY,
} from '@/workflow/constants/ManualTriggerMetadata';
import { type Node } from '@/workflow/workflow-schema/types/base-output-schema.type';
import { type RecordFieldNode } from '@/workflow/workflow-schema/types/output-schema.type';

const METADATA_LABEL = 'Metadata';

const WORKSPACE_MEMBER_ID_LABEL = 'Workspace Member ID';

// Used for GLOBAL and BULK_RECORDS manual triggers, whose output schema is a
// plain base schema.
export const buildManualTriggerMetadataNode = (): Node => ({
  isLeaf: false,
  type: 'object',
  label: METADATA_LABEL,
  value: {
    [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: {
      isLeaf: true,
      type: 'string',
      label: WORKSPACE_MEMBER_ID_LABEL,
      value: '',
    },
  },
});

// Used for SINGLE_RECORD manual triggers, whose output schema is a record: the
// metadata is exposed as a record field (rendered like a composite field).
export const buildManualTriggerMetadataRecordField = (): RecordFieldNode => ({
  isLeaf: false,
  type: FieldMetadataType.RAW_JSON,
  label: METADATA_LABEL,
  fieldMetadataId: WORKFLOW_TRIGGER_METADATA_KEY,
  value: {
    [WORKFLOW_TRIGGER_METADATA_WORKSPACE_MEMBER_ID_KEY]: {
      isLeaf: true,
      type: FieldMetadataType.UUID,
      label: WORKSPACE_MEMBER_ID_LABEL,
      value: '',
      fieldMetadataId: WORKFLOW_TRIGGER_METADATA_KEY,
      isCompositeSubField: true,
    },
  },
});
