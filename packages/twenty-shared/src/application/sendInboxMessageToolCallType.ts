import { type AskQuestionsToolInput } from '@/ai/types/AskQuestionsToolInput';
import { type ProposedEmail } from '@/ai/types/ProposedEmail';
import { type RequestFormToolInput } from '@/ai/types/RequestFormToolInput';

export type SendInboxMessageToolCall =
  | {
      toolName: 'ask_questions';
      input: AskQuestionsToolInput;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      toolName: 'request_form';
      input: RequestFormToolInput;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      toolName: 'propose_email';
      input: ProposedEmail;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      logicFunctionUniversalIdentifier: string;
      toolName?: never;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
    };
