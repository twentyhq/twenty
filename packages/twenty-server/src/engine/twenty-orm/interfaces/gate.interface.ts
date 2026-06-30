export interface Gate {
  featureFlag: string;
  excludeFromDatabase?: boolean;
  excludeFromWorkspaceApi?: boolean;
}
