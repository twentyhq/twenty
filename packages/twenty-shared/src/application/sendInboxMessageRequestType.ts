import { type AskQuestionsToolInput } from '@/ai/types/AskQuestionsToolInput';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';
import { type RequestFormToolInput } from '@/ai/types/RequestFormToolInput';

export type SendInboxMessageRequest =
  | { toolName: 'ask_questions'; input: AskQuestionsToolInput }
  | { toolName: 'request_form'; input: RequestFormToolInput }
  | { toolName: 'propose_email'; input: ProposedEmail }
  | {
      logicFunctionUniversalIdentifier: string;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
    };
