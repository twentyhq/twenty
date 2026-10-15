import { ASK_QUESTION_TOOL_NAME } from './ask-question-tool-name.const';
import { ASK_QUESTIONS_TOOL_NAME } from './ask-questions-tool-name.const';
import { PROPOSE_TOOL_CALL_TOOL_NAME } from './propose-tool-call-tool-name.const';
import { REQUEST_FORM_TOOL_NAME } from './request-form-tool-name.const';

export const PAUSING_TOOL_NAMES: ReadonlySet<string> = new Set([
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
]);
