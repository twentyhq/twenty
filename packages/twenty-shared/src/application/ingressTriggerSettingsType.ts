export type WebhookWorkspaceIdSource = 'body' | 'query' | 'header';

export type IngressTriggerSettings = {
  workspaceIdResolver: {
    source: WebhookWorkspaceIdSource;
    path: string;
  };
  forwardedRequestHeaders?: string[];
};
