export type MetadataCaller =
  | { type: 'bypassesPrivacy' }
  | { type: 'workspaceMember'; userWorkspaceId: string }
  | { type: 'withoutWorkspaceMember' };
