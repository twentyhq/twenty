import { type ProposedEmail } from '@/ai/types/ProposedEmail';

export type ProposeEmailToolStatus =
  | 'pending'
  | 'sent'
  | 'drafted'
  | 'discarded'
  | 'failed'
  | 'skipped';

export type ProposeEmailToolResult = {
  status: ProposeEmailToolStatus;
  email: ProposedEmail;
  error?: string;
};
