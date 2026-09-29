import { type AskQuestionItem } from '@/ai/types/AskQuestionItem';
import { type InputAskFormField } from '@/ai/types/InputAskFormField';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';

// What an Ask shows the person it waits on. The kind decides how it renders
// and which response answers it:
// - questions: InputAskQuestionsResponse
// - formFields: InputAskFormFieldsResponse
// - emailApproval: InputAskEmailApprovalResponse
export type InputAskQuestionsForm = {
  kind: 'questions';
  questions: AskQuestionItem[];
};

export type InputAskFormFieldsForm = {
  kind: 'formFields';
  fields: InputAskFormField[];
};

export type InputAskEmailApprovalForm = {
  kind: 'emailApproval';
  email: ProposedEmail;
};

export type InputAskForm =
  | InputAskQuestionsForm
  | InputAskFormFieldsForm
  | InputAskEmailApprovalForm;
