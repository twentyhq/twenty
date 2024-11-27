export type WorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId: string;
  events: WorkspaceEvent[];
};
