import { type UIMessage } from 'ai';

import { type ExtractedFile } from 'src/engine/metadata-modules/ai/ai-chat/types/extracted-file.type';

export type ExtractCodeInterpreterFilesResult = {
  processedMessages: UIMessage[];
  extractedFiles: ExtractedFile[];
};
