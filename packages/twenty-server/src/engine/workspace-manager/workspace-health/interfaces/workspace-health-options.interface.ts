export enum WorkspaceHealthMode {
  Structure = 'structure',
  Metadata = 'metadata',
  All = 'all',
}

export interface WorkspaceHealthOptions {
  mode: WorkspaceHealthMode;
}
