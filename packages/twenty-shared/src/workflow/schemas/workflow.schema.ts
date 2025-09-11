import { z } from 'zod';
import { FieldMetadataType } from '../../types/FieldMetadataType';
import { StepLogicalOperator } from '../../types/StepFilters';
import { ViewFilterOperand } from '../../types/ViewFilterOperand';
import { StepStatus } from '../types/WorkflowRunStateStepInfos';

// Base schemas
export const objectRecordSchema = z
  .record(z.any())
  .describe(
    'Record data object. Use nested objects for relationships (e.g., "company": {"id": "{{reference}}"}). Common patterns:\n' +
    '- Person: {"name": {"firstName": "John", "lastName": "Doe"}, "emails": {"primaryEmail": "john@example.com"}, "company": {"id": "{{trigger.object.id}}"}}\n' +
    '- Company: {"name": "Acme Corp", "domainName": {"primaryLinkUrl": "https://acme.com"}}\n' +
    '- Task: {"title": "Follow up", "status": "TODO", "assignee": {"id": "{{user.id}}"}}',
  );

export const baseWorkflowActionSettingsSchema = z.object({
  input: z
    .object({})
    .passthrough()
    .describe('Input data for the workflow action. Structure depends on the action type.'),
  outputSchema: z
    .object({})
    .passthrough()
    .describe(
      'Schema defining the output data structure. This data can be referenced in subsequent steps using {{stepId.fieldName}}.',
    ),
  errorHandlingOptions: z.object({
    retryOnFailure: z.object({
      value: z.boolean().describe('Whether to retry the action if it fails.'),
    }),
    continueOnFailure: z.object({
      value: z.boolean().describe('Whether to continue to the next step if this action fails.'),
    }),
  }),
});

export const baseWorkflowActionSchema = z.object({
  id: z
    .string()
    .describe('Unique identifier for the workflow step. Must be unique within the workflow.'),
  name: z
    .string()
    .describe('Human-readable name for the workflow step. Should clearly describe what the step does.'),
  valid: z
    .boolean()
    .describe('Whether the step configuration is valid. Set to true when all required fields are properly configured.'),
  nextStepIds: z
    .array(z.string())
    .optional()
    .nullable()
    .describe('Array of step IDs that this step connects to. Leave empty or null for the final step.'),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional()
    .nullable()
    .describe('Position coordinates for the step in the workflow diagram.'),
});

export const baseTriggerSchema = z.object({
  name: z
    .string()
    .optional()
    .describe('Human-readable name for the trigger. Optional but recommended for clarity.'),
  type: z
    .enum(['DATABASE_EVENT', 'MANUAL', 'CRON', 'WEBHOOK'])
    .describe(
      'Type of trigger. DATABASE_EVENT for record changes, MANUAL for user-initiated, CRON for scheduled, WEBHOOK for external calls.',
    ),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional()
    .nullable()
    .describe('Position coordinates for the trigger in the workflow diagram. Use (0, 0) for the trigger step.'),
  nextStepIds: z
    .array(z.string())
    .optional()
    .nullable()
    .describe('Array of step IDs that the trigger connects to. These are the first steps in the workflow.'),
});

// Action settings schemas
export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      serverlessFunctionId: z.string(),
      serverlessFunctionVersion: z.string(),
      serverlessFunctionInput: z.record(z.any()),
    }),
  });

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      email: z.string(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
  });

export const workflowCreateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z
        .string()
        .describe(
          'The name of the object to create a record in. Must be lowercase (e.g., "person", "company", "task").',
        ),
      objectRecord: objectRecordSchema
        .describe(
          'The record data to create.',
        )
    }),
  });

export const workflowUpdateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
      objectRecordId: z.string(),
      fieldsToUpdate: z.array(z.string()),
    }),
  });

export const workflowDeleteRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecordId: z.string(),
    }),
  });

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.number().optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(z.object({})).optional(),
          recordFilters: z.array(z.object({})).optional(),
          gqlOperationFilter: z.object({}).optional().nullable(),
        })
        .optional(),
    }),
  });

export const workflowFormActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        label: z.string(),
        type: z.union([
          z.literal(FieldMetadataType.TEXT),
          z.literal(FieldMetadataType.NUMBER),
          z.literal(FieldMetadataType.DATE),
          z.literal('RECORD'),
        ]),
        placeholder: z.string().optional(),
        settings: z.record(z.any()).optional(),
        value: z.any().optional(),
      }),
    ),
  });

export const workflowHttpRequestActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      url: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      headers: z.record(z.string()).optional(),
      body: z
        .record(
          z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
          ]),
        )
        .or(z.string())
        .optional(),
    }),
  });

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string().optional(),
      prompt: z.string().optional(),
    }),
  });

export const workflowFilterActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(z.object({
        id: z.string(),
        logicalOperator: z.nativeEnum(StepLogicalOperator),
        parentStepFilterGroupId: z.string().optional(),
        positionInStepFilterGroup: z.number().optional(),
      })),
      stepFilters: z.array(z.object({
        id: z.string(),
        type: z.string(),
        stepOutputKey: z.string(),
        operand: z.nativeEnum(ViewFilterOperand),
        value: z.string(),
        stepFilterGroupId: z.string(),
        positionInStepFilterGroup: z.number().optional(),
        fieldMetadataId: z.string().optional(),
        compositeFieldSubFieldName: z.string().optional(),
      })),
    }),
  });

export const workflowIteratorActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      items: z.union([z.array(z.union([z.string(), z.number(), z.boolean(), z.null(), z.record(z.any()), z.any()])), z.string()]).optional(),
      initialLoopStepIds: z.array(z.string()).optional(),
    }),
  });

export const workflowEmptyActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({}),
  });

// Action schemas
export const workflowCodeActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CODE'),
  settings: workflowCodeActionSettingsSchema,
});

export const workflowSendEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('SEND_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});

export const workflowCreateRecordActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CREATE_RECORD'),
  settings: workflowCreateRecordActionSettingsSchema,
});

export const workflowUpdateRecordActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('UPDATE_RECORD'),
  settings: workflowUpdateRecordActionSettingsSchema,
});

export const workflowDeleteRecordActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('DELETE_RECORD'),
  settings: workflowDeleteRecordActionSettingsSchema,
});

export const workflowFindRecordsActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FIND_RECORDS'),
  settings: workflowFindRecordsActionSettingsSchema,
});

export const workflowFormActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FORM'),
  settings: workflowFormActionSettingsSchema,
});

export const workflowHttpRequestActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('HTTP_REQUEST'),
  settings: workflowHttpRequestActionSettingsSchema,
});

export const workflowAiAgentActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('AI_AGENT'),
  settings: workflowAiAgentActionSettingsSchema,
});

export const workflowFilterActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FILTER'),
  settings: workflowFilterActionSettingsSchema,
});

export const workflowIteratorActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('ITERATOR'),
  settings: workflowIteratorActionSettingsSchema,
});

export const workflowEmptyActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('EMPTY'),
  settings: workflowEmptyActionSettingsSchema,
});

// Combined action schema
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

// Trigger schemas
export const workflowDatabaseEventTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('DATABASE_EVENT'),
  settings: z.object({
    eventName: z
      .string()
      .regex(
        /^[a-z][a-zA-Z0-9_]*\.(created|updated|deleted)$/,
        'Event name must follow the pattern: objectName.action (e.g., "company.created", "person.updated")',
      )
      .describe(
        'Event name in format: objectName.action (e.g., "company.created", "person.updated", "task.deleted"). Use lowercase object names.',
      ),
    input: z.object({}).passthrough().optional(),
    outputSchema: z
      .object({})
      .passthrough()
      .describe(
        'Schema defining the output data structure. For database events, this includes the record that triggered the workflow accessible via {{trigger.object.fieldName}}.',
      ),
    objectType: z.string().optional(),
    fields: z.array(z.string()).optional().nullable(),
  }),
}).describe(
  'Database event trigger that fires when a record is created, updated, or deleted. The triggered record is accessible in workflow steps via {{trigger.object.fieldName}}.',
);

export const workflowManualTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('MANUAL'),
  settings: z.object({
    objectType: z.string().optional(),
    outputSchema: z
      .object({})
      .passthrough()
      .describe(
        'Schema defining the output data structure. When a record is selected, it is accessible via {{trigger.record.fieldName}}. When no record is selected, no data is available.',
      ),
    icon: z.string().optional(),
    isPinned: z.boolean().optional(),
  }),
}).describe(
  'Manual trigger that can be launched by the user. If a record is selected when launched, it is accessible via {{trigger.record.fieldName}}. If no record is selected, no data context is available.',
);

export const workflowCronTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('CRON'),
  settings: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('DAYS'),
      schedule: z.object({
        day: z.number().min(1),
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('HOURS'),
      schedule: z.object({
        hour: z.number().min(1),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('MINUTES'),
      schedule: z.object({ minute: z.number().min(1) }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('CUSTOM'),
      pattern: z.string(),
      outputSchema: z.object({}).passthrough(),
    }),
  ]),
});

export const workflowWebhookTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('WEBHOOK'),
  settings: z.discriminatedUnion('httpMethod', [
    z.object({
      outputSchema: z.object({}).passthrough(),
      httpMethod: z.literal('GET'),
      authentication: z.literal('API_KEY').nullable(),
    }),
    z.object({
      outputSchema: z.object({}).passthrough(),
      httpMethod: z.literal('POST'),
      expectedBody: z.object({}).passthrough(),
      authentication: z.literal('API_KEY').nullable(),
    }),
  ]),
});

// Combined trigger schema
export const workflowTriggerSchema = z.discriminatedUnion('type', [
  workflowDatabaseEventTriggerSchema,
  workflowManualTriggerSchema,
  workflowCronTriggerSchema,
  workflowWebhookTriggerSchema,
]);

export const workflowRunStepStatusSchema = z.nativeEnum(StepStatus);

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
});

export const workflowRunStateStepInfosSchema = z.record(
  workflowRunStateStepInfoSchema,
);

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(workflowActionSchema),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});

export const workflowRunStatusSchema = z.enum([
  'NOT_STARTED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'ENQUEUED',
]);

export const workflowRunSchema = z
  .object({
    __typename: z.literal('WorkflowRun'),
    id: z.string(),
    workflowVersionId: z.string(),
    workflowId: z.string(),
    state: workflowRunStateSchema.nullable(),
    status: workflowRunStatusSchema,
    createdAt: z.string(),
    deletedAt: z.string().nullable(),
    endedAt: z.string().nullable(),
    name: z.string(),
  })
  .passthrough();
