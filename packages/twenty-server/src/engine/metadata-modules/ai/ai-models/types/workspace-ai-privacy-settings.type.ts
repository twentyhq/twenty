import { type AiDataPolicy } from 'twenty-shared/ai';

export type WorkspaceAiPrivacySettings = AiDataPolicy & {
  isProductImprovementDataSharingEnabled: boolean;
};
