import { type AskQuestionsToolInput } from '@/ai/types/AskQuestionsToolInput';
import { type ProposeToolCallToolInput } from '@/ai/types/ProposeToolCallToolInput';
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
      // the approved call runs with the member's permissions
      toolName: 'propose_tool_call';
      input: ProposeToolCallToolInput;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      logicFunctionUniversalIdentifier: string;
      toolName?: never;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
    };
