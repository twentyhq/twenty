import { type ProposeToolCallToolInput } from 'twenty-shared/ai';

import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';

export type ResolveInboxProposal = (
  input: ProposeToolCallToolInput,
) => Promise<ProposedToolCallResolution>;
