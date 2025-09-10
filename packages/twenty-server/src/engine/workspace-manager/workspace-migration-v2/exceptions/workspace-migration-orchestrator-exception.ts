export class WorkspaceMigrationOrchestratorException extends Error {
  constructor(message = 'Workspace migration orchestrator failed') {
    super(message);
    this.name = 'WorkspaceMigrationOrchestratorException';
  }
}
