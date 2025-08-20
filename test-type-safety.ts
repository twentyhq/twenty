// Test file to verify type safety - this should produce compile errors
import { createActionService } from './packages/twenty-server/src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';
import { WorkspaceMigrationActionRunnerArgs } from './packages/twenty-server/src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { CreateFieldAction, UpdateFieldAction } from './packages/twenty-server/src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';

// This should work fine - correct match
export class CorrectFieldCreateActionService extends createActionService('create_field') {
  constructor() {
    super();
  }

  async execute(context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>): Promise<void> {
    // This should work because CreateFieldAction matches 'create_field'
  }
}

// This should cause a TypeScript error - wrong action type
export class WrongFieldActionService extends createActionService('create_field') {
  constructor() {
    super();
  }

  async execute(context: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>): Promise<void> {
    // This should fail because UpdateFieldAction doesn't match 'create_field'
  }
}