import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';
import {
  FlatDeleteSharingRuleAction,
  UniversalDeleteSharingRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/sharing-rule/types/workspace-migration-sharing-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSharingRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'sharingRule',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteSharingRuleAction>,
  ): Promise<FlatDeleteSharingRuleAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteSharingRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const sharingRuleRepository =
      queryRunner.manager.getRepository<SharingRuleEntity>(SharingRuleEntity);

    await sharingRuleRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteSharingRuleAction>,
  ): Promise<void> {
    return;
  }
}
