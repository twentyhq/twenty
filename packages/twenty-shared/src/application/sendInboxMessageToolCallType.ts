import { type AskQuestionToolInput } from '@/ai/types/AskQuestionToolInput';
import { type ProposeToolCallToolInput } from '@/ai/types/ProposeToolCallToolInput';
import { type RequestFormToolInput } from '@/ai/types/RequestFormToolInput';

export type SendInboxMessageToolCall =
  | {
      toolName: 'ask_question';
      input: AskQuestionToolInput;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      toolName: 'request_form';
      input: RequestFormToolInput;
      logicFunctionUniversalIdentifier?: never;
    }
  | {
      // a call the app could run itself, which runs with the member's permissions once approved
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
