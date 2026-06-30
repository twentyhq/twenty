export type CustomWorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId?: string;
  events: WorkspaceEvent[];
};
