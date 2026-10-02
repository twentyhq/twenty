import {
  PROPOSE_TOOL_CALL_TOOL_NAME,
  type ProposeToolCallToolInput,
  type ProposeToolCallToolResult,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export { PROPOSE_TOOL_CALL_TOOL_NAME };

export const proposeToolCallInputSchema = z.object({
  toolName: z
    .string()
    .min(1)
    .describe(
      'The name of the tool to run once approved, as you would call it yourself.',
    ),
  arguments: z
    .record(z.string(), z.unknown())
    .describe(
      "The tool's arguments, matching its input schema. Call learn_tools first if you have not seen the schema.",
    ),
  summary: z
    .string()
    .min(1)
    .describe(
      'One sentence on what the call does and why, shown to the person deciding (e.g. "Raise the Acme renewal to 120k based on the signed quote").',
    ),
});

export const proposedToolCallSchema: z.ZodType<ProposedToolCall> = z.object({
  toolName: z.string(),
  toolLabel: z.string(),
  summary: z.string(),
  arguments: z.record(z.string(), z.unknown()),
  template: z.enum(['recordCreate', 'recordUpdate', 'recordDelete', 'generic']),
  objectNameSingular: z.string().optional(),
  recordId: z.string().optional(),
  currentValues: z.record(z.string(), z.unknown()).optional(),
});

type ProposeToolCallPendingOutput = {
  success: true;
  message: string;
  result: ProposeToolCallToolResult;
};

export const buildProposeToolCallPendingOutput = (
  proposal: ProposedToolCall,
): ProposeToolCallPendingOutput => ({
  success: true,
  message: 'Tool call proposed to the user; awaiting their decision.',
  result: { status: 'pending', proposal },
});

export const createProposeToolCallTool = ({
  resolveProposal,
}: {
  resolveProposal: (
    input: ProposeToolCallToolInput,
  ) => Promise<{ proposal: ProposedToolCall } | { error: string }>;
}) => ({
  description:
    'Propose a tool call for a person to approve before it runs, instead of calling the tool yourself. ' +
    'Most calls need no approval: use this only when the action is hard to undo or reaches people outside ' +
    'the workspace, when you are unsure it matches what the person wants, or when your instructions ask ' +
    'for approval. Never use it for reads. The conversation pauses until the person approves it, possibly ' +
    'after editing the arguments, or rejects it with optional feedback. You then get the tool result or ' +
    'their feedback. Propose one call at a time.',
  inputSchema: proposeToolCallInputSchema,
  execute: async (
    input: ProposeToolCallToolInput,
  ): Promise<ProposeToolCallPendingOutput | ToolOutput> => {
    const resolution = await resolveProposal(input);

    return 'error' in resolution
      ? {
          success: false,
          message: 'The tool call could not be proposed',
          error: resolution.error,
        }
      : buildProposeToolCallPendingOutput(resolution.proposal);
  },
});
