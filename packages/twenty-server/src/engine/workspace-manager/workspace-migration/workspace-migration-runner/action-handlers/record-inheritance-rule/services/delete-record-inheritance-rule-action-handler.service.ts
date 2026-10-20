/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RecordInheritanceRuleEntity } from 'src/engine/metadata-modules/record-inheritance-rule/entities/record-inheritance-rule.entity';
import {
  FlatDeleteRecordInheritanceRuleAction,
  UniversalDeleteRecordInheritanceRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/record-inheritance-rule/types/workspace-migration-record-inheritance-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRecordInheritanceRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'recordInheritanceRule',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteRecordInheritanceRuleAction>,
  ): Promise<FlatDeleteRecordInheritanceRuleAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteRecordInheritanceRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const repository =
      queryRunner.manager.getRepository<RecordInheritanceRuleEntity>(
        RecordInheritanceRuleEntity,
      );

    await repository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteRecordInheritanceRuleAction>,
  ): Promise<void> {
    return;
  }
}
