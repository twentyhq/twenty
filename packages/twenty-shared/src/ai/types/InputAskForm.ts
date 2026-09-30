import type z from 'zod';

import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';
import { type workflowFormActionSettingsSchema } from '@/workflow/schemas/form-action-settings-schema';

// What an Ask shows the person it waits on. The kind decides how it renders
// and which response answers it:
// - questions: the answer to each question
// - formFields: each field's value, keyed by its name
// - emailApproval: InputAskEmailApprovalResponse
export type InputAskForm =
  | { kind: 'questions'; questions: AskQuestionItem[] }
  | {
      kind: 'formFields';
      // A snapshot of the form step's fields.
      fields: z.infer<typeof workflowFormActionSettingsSchema>['input'];
    }
  | { kind: 'emailApproval'; email: ProposedEmail };
