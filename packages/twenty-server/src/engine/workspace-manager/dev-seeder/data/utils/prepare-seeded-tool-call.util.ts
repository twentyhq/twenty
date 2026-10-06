import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

// seeds make their calls as any caller does, so they render and answer like live ones
export const prepareSeededToolCall = async (call: SeededToolCall) => {
  const pausingTool = PAUSING_TOOLS.get(call.toolName);
  const preparedCall = await pausingTool?.prepareCall(call.input, call.context);

  if (!isDefined(preparedCall) || 'error' in preparedCall) {
    throw new Error(`Seeded ${call.toolName} call cannot be made`);
  }

  const pausingToolCall = pausingTool?.parseCall(
    call.input,
    preparedCall.pendingOutput,
  );

  if (!isDefined(pausingToolCall)) {
    throw new Error(`Seeded ${call.toolName} call does not parse`);
  }

  return { pendingOutput: preparedCall.pendingOutput, pausingToolCall };
};
