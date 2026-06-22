export type WebhookWorkspaceIdSource = 'body' | 'query' | 'header';

export type ServerWebhookTriggerSettings = {
  workspaceIdResolver: {
    source: WebhookWorkspaceIdSource;
    path: string;
  };
  forwardedRequestHeaders?: string[];
};
