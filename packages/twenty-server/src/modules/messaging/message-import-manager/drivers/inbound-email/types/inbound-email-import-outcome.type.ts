export type InboundEmailImportOutcome =
  | { kind: 'imported'; workspaceId: string; messageChannelId: string }
  | { kind: 'unmatched'; recipient: string | null }
  | { kind: 'unconfigured' };
