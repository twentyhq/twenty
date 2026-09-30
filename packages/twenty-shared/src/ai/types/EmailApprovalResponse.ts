import { type EmailApprovalDecision } from '@/ai/types/EmailApprovalDecision';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';

// The email is the one the person approved, edited or not; a discard needs
// none.
export type EmailApprovalResponse = {
  decision: EmailApprovalDecision;
  email?: ProposedEmail;
};
