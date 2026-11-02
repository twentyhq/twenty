import { type AiRunUsage } from './aiRunUsageType';

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
