export type InboundEmailImportOutcome =
  | { kind: 'imported'; workspaceId: string; messageChannelId: string }
  | { kind: 'unmatched'; recipient: string | null }
  | { kind: 'loop_dropped'; workspaceId: string }
  | { kind: 'unconfigured' };
