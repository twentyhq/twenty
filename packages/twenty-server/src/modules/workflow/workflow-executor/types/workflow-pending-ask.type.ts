import { type PausingToolAsk } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-ask.type';
import { type InputAskToolCallKey } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';

// What a step that waits on a person is waiting for. The run opens each as
// an Ask when it parks the step, under the same lock as that transition.
export type WorkflowPendingAsk = PausingToolAsk &
  (InputAskToolCallKey | { threadId?: undefined; toolCallId?: undefined });
