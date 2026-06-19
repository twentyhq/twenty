export type WebhookWorkspaceIdSource = 'body' | 'query' | 'header';

export type IngressTriggerSettings = {
  workspaceId: {
    source: WebhookWorkspaceIdSource;
    path: string;
  };
  forwardedRequestHeaders?: string[];
};
