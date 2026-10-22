import { v5 as uuidv5 } from 'uuid';

import { ASSISTANT_MESSAGE_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-chat/constants/assistant-message-id-namespace.constant';

// the reply id derives from the stream, so a retried job overwrites its own reply while each resume writes its own
export const buildStreamAssistantMessageId = (streamId: string): string =>
  uuidv5(streamId, ASSISTANT_MESSAGE_ID_NAMESPACE);
