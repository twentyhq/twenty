import {
  REQUEST_FORM_TOOL_NAME,
  type RequestFormField,
} from 'twenty-shared/ai';

import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

export const requestFormCall = (
  fields: RequestFormField[],
): SeededToolCall => ({
  toolName: REQUEST_FORM_TOOL_NAME,
  input: { fields },
});
