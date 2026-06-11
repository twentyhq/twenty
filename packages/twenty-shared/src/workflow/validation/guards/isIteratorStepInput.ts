import { isObject } from '@sniptt/guards';

import { type IteratorStepInput } from '@/workflow/validation/types/workflow-validation.type';

// Step inputs are authored in the workflow editor and may be incomplete while a
// step is being configured, so we only assert the shape we consume here.
export const isIteratorStepInput = (
  input: unknown,
): input is Partial<IteratorStepInput> =>
  isObject(input) &&
  Array.isArray((input as Partial<IteratorStepInput>).initialLoopStepIds);
