import { AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-storage-key-prefix.constant';

export const buildAiSearchAnswerAutomaticAllowanceBuckets = ({
  workspaceId,
  userWorkspaceId,
  userAllowance,
  workspaceAllowance,
  windowMs,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  userAllowance: number;
  workspaceAllowance: number;
  windowMs: number;
}) => [
  {
    key: `${AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX}:automatic:${workspaceId}:${userWorkspaceId}`,
    burst: userAllowance,
    refillPerWindow: userAllowance,
    windowMs,
  },
  {
    key: `${AI_SEARCH_ANSWER_STORAGE_KEY_PREFIX}:automatic:${workspaceId}`,
    burst: workspaceAllowance,
    refillPerWindow: workspaceAllowance,
    windowMs,
  },
];
