import { type UIMessageChunk } from 'ai';
import { type z } from 'zod';

import { type AiRunUsage } from './aiRunUsageType';
import { type generateInputSchema } from './generateInputSchema';
import { type RunAgentMessage } from './runAgentType';

export type GenerateMutationInput = z.infer<typeof generateInputSchema>;

// a string input is sent as one user message
export type GenerateInput = Omit<GenerateMutationInput, 'input'> & {
  input: string | RunAgentMessage[];
  onChunk?: (chunk: UIMessageChunk) => void | Promise<void>;
  signal?: AbortSignal;
};

export type GenerateResult = {
  success: boolean;
  text: string | null;
  object: Record<string, unknown> | null;
  error: string | null;
  // the run's recorded turn, with its model, usage and credits
  runId: string;
  // what the run spent, including the steps that finished before a failure
  usage: AiRunUsage;
};
