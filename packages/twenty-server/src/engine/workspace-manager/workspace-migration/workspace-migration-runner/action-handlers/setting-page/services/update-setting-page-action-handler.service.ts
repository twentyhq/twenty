import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { SettingPageEntity } from 'src/engine/metadata-modules/setting-page/entities/setting-page.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateSettingPageAction,
  UniversalUpdateSettingPageAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/setting-page/types/workspace-migration-setting-page-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateSettingPageActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'settingPage',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateSettingPageAction>,
  ): Promise<FlatUpdateSettingPageAction> {
    const { action, allFlatEntityMaps } = context;

    const flatSettingPage = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatSettingPageMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'settingPage',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'settingPage',
      entityId: flatSettingPage.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateSettingPageAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const settingPageRepository =
      queryRunner.manager.getRepository<SettingPageEntity>(SettingPageEntity);

    await settingPageRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateSettingPageAction>,
  ): Promise<void> {
    return;
  }
}
