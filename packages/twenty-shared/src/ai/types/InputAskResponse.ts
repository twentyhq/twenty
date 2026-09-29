import { type AskQuestionAnswer } from '@/ai/types/AskQuestionAnswer';
import { type EmailApprovalDecision } from '@/ai/types/EmailApprovalDecision';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';

export type InputAskQuestionsResponse = {
  answers: AskQuestionAnswer[];
};

// Keyed by each field's name.
export type InputAskFormFieldsResponse = Record<string, unknown>;

// The email is the one the person approved, edited or not; a discard needs
// none.
export type InputAskEmailApprovalResponse = {
  decision: EmailApprovalDecision;
  email?: ProposedEmail;
};

export type InputAskResponse =
  | InputAskQuestionsResponse
  | InputAskFormFieldsResponse
  | InputAskEmailApprovalResponse;
