import { z } from 'zod';
import { workflowAiAgentActionSchema } from './ai-agent-action-schema';
import { workflowCodeActionSchema } from './code-action-schema';
import { workflowCreateRecordActionSchema } from './create-record-action-schema';
import { workflowDeleteRecordActionSchema } from './delete-record-action-schema';
import { workflowEmptyActionSchema } from './empty-action-schema';
import { workflowFilterActionSchema } from './filter-action-schema';
import { workflowFindRecordsActionSchema } from './find-records-action-schema';
import { workflowFormActionSchema } from './form-action-schema';
import { workflowHttpRequestActionSchema } from './http-request-action-schema';
import { workflowIfElseActionSchema } from './if-else-action-schema';
import { workflowIteratorActionSchema } from './iterator-action-schema';
import { workflowSendEmailActionSchema } from './send-email-action-schema';
import { workflowUpdateRecordActionSchema } from './update-record-action-schema';
import { workflowUpsertRecordActionSchema } from './upsert-record-action-schema';
import { workflowDelayActionSchema } from './workflow-delay-action-schema';

export const workflowActionSchema = z.discriminatedUnion('type', [
  workflowCodeActionSchema,
  workflowSendEmailActionSchema,
  workflowCreateRecordActionSchema,
  workflowUpdateRecordActionSchema,
  workflowDeleteRecordActionSchema,
  workflowUpsertRecordActionSchema,
  workflowFindRecordsActionSchema,
  workflowFormActionSchema,
  workflowHttpRequestActionSchema,
  workflowAiAgentActionSchema,
  workflowFilterActionSchema,
  workflowIfElseActionSchema,
  workflowIteratorActionSchema,
  workflowDelayActionSchema,
  workflowEmptyActionSchema,
]);
