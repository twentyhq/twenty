export type PrivatableEntityCallerScope =
  | { type: 'all' }
  | { type: 'shared' }
  | { type: 'sharedAndOwned'; userWorkspaceId: string };
