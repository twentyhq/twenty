import { createHash } from 'crypto';

import { AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-storage-key-prefix.constant';
import { normalizeAiSearchAnswerQuestion } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/normalize-ai-search-answer-question.util';

// The evidence is fetched under the caller's permissions on every request, so changed data or revoked access changes the key
export const buildAiSearchAnswerCacheKey = ({
  workspaceId,
  userWorkspaceId,
  question,
  searchScope,
  serializedEvidence,
  modelId,
  systemPrompt,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  question: string;
  searchScope: string | null;
  serializedEvidence: string;
  modelId: string;
  systemPrompt: string;
}) => {
  const contentHash = createHash('sha256')
    .update(
      JSON.stringify([
        normalizeAiSearchAnswerQuestion(question),
        searchScope,
        serializedEvidence,
        modelId,
        systemPrompt,
      ]),
    )
    .digest('hex');

  return `${AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX}:answer:${workspaceId}:${userWorkspaceId}:${contentHash}`;
};
