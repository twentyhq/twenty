import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { CreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_page_layout_tab',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreatePageLayoutTabAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutTabMaps } = allFlatEntityMaps;
    const { flatEntity } = action;

    const updatedFlatPageLayoutTabMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    return {
      flatPageLayoutTabMaps: updatedFlatPageLayoutTabMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutTabAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity } = action;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}
