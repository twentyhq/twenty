export class WorkspaceMigrationAppliedEvent {
  private readonly _workspaceId: string;

  constructor(worskapceId: string) {
    this._workspaceId = worskapceId;
  }

  get workspaceId(): string {
    return this._workspaceId;
  }
}
