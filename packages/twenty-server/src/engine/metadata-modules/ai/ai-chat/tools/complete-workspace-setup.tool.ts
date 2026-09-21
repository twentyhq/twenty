import { z } from 'zod';

import { COMPLETE_WORKSPACE_SETUP_TOOL_NAME } from 'twenty-shared/ai';

export { COMPLETE_WORKSPACE_SETUP_TOOL_NAME };

export const completeWorkspaceSetupInputSchema = z.object({});

type CompleteWorkspaceSetupOutput = {
  success: true;
  message: string;
};

export const createCompleteWorkspaceSetupTool = () => ({
  description:
    'Mark the workspace setup conversation as finished. Call it exactly once, at the very end ' +
    'of your final reply, right after the closing recap, and only once every remaining ' +
    'capability has been accepted and built or declined, or the user says they are done. The ' +
    'call closes the full-page setup screen: the user lands on their Companies view and this ' +
    'conversation continues in a side panel next to their work. Never call it while a question ' +
    'is unanswered or while anything the user accepted is still unbuilt, and never call it twice.',
  inputSchema: completeWorkspaceSetupInputSchema,
  execute: async (): Promise<CompleteWorkspaceSetupOutput> => ({
    success: true,
    message:
      'Setup marked as finished. The setup screen is closing; the user now sees their ' +
      'Companies view and this conversation continues in the side panel.',
  }),
});
