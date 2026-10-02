import { type EmailApprovalDecision } from '@/ai/types/EmailApprovalDecision';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';

export type EmailApprovalResponse = {
  decision: EmailApprovalDecision;
  email?: ProposedEmail;
};
