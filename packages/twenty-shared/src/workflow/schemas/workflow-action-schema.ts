import { z } from 'zod';
import { workflowAiAgentActionSchema } from './ai-agent-action';
import { workflowCodeActionSchema } from './code-action';
import { workflowCreateRecordActionSchema } from './create-record-action';
import { workflowDeleteRecordActionSchema } from './delete-record-action';
import { workflowEmptyActionSchema } from './empty-action';
import { workflowFilterActionSchema } from './filter-action';
import { workflowFindRecordsActionSchema } from './find-records-action';
import { workflowFormActionSchema } from './form-action';
import { workflowHttpRequestActionSchema } from './http-request-action';
import { workflowIteratorActionSchema } from './iterator-action';
import { workflowSendEmailActionSchema } from './send-email-action';
import { workflowUpdateRecordActionSchema } from './update-record-action';

export const workflowActionSchema = z.discriminatedUnion('type', [
  workflowCodeActionSchema,
  workflowSendEmailActionSchema,
  workflowCreateRecordActionSchema,
  workflowUpdateRecordActionSchema,
  workflowDeleteRecordActionSchema,
  workflowFindRecordsActionSchema,
  workflowFormActionSchema,
  workflowHttpRequestActionSchema,
  workflowAiAgentActionSchema,
  workflowFilterActionSchema,
  workflowIteratorActionSchema,
  workflowEmptyActionSchema,
]);
