import {
  type workflowConversationSchema,
  type workflowConversationScopeSchema,
} from '@/workflow/schemas/workflow-conversation-schema';
import type z from 'zod';

export type WorkflowConversation = z.infer<typeof workflowConversationSchema>;

export type WorkflowConversationScope = z.infer<
  typeof workflowConversationScopeSchema
>;
