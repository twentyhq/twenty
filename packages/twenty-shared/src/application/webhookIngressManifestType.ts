export type WebhookWorkspaceIdSource = 'body' | 'query' | 'header';

export type WebhookIngressManifest = {
  workspaceId: {
    source: WebhookWorkspaceIdSource;
    path: string;
  };
};
