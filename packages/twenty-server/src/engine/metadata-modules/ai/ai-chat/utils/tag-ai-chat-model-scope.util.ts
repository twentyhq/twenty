import * as Sentry from '@sentry/node';

export const tagAiChatModelScope = ({ modelId }: { modelId: string }) => {
  Sentry.getCurrentScope().setTag('modelId', modelId);
};
