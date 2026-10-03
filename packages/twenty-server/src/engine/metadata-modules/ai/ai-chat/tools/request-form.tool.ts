import { type RequestFormToolInput } from 'twenty-shared/ai';

import {
  buildRequestFormPendingOutput,
  requestFormInputSchema,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/request-form.pausing-tool';

export const createRequestFormTool = () => ({
  description:
    'Ask the user to fill in a form when you need typed values from them: text, numbers, dates, ' +
    'options of an existing select field, or records picked from the workspace. The conversation ' +
    'pauses until they submit it, then continues with the values keyed by field name. Prefer ' +
    'ask_questions for a choice between a few options you can list yourself.',
  inputSchema: requestFormInputSchema,
  execute: async (_input: RequestFormToolInput) =>
    buildRequestFormPendingOutput(),
});
