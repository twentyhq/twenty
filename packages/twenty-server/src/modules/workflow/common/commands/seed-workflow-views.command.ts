import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'workflow:seed:views',
  description: 'Seed workflow views for workspace.',
})
export class SeedWorkflowViewsCommand extends ActiveWorkspacesCommandRunner {
  protected readonly logger: Logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
    this.logger = new Logger(this.constructor.name);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: ActiveWorkspacesCommandOptions,
    _workspaceIds: string[],
  ): Promise<void> {
    const { dryRun } = _options;

    for (const workspaceId of _workspaceIds) {
      await this.execute(workspaceId, dryRun);
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
    this.logger.log(`Seeding workflow views for workspace: ${workspaceId}`);

    const workflowViewId = await this.seedView(
      workspaceId,
      'workflow',
      'All Workflows',
    );

    await this.seedView(
      workspaceId,
      'workflowVersion',
      'All Workflow Versions',
    );

    await this.seedView(workspaceId, 'workflowRun', 'All Workflow Runs');

    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'favorite',
      );

    const existingFavorites = await favoriteRepository.find({
      where: {
        viewId: workflowViewId,
      },
    });

    if (existingFavorites.length > 0) {
      this.logger.log(
        `Favorite already exists for view: ${existingFavorites[0].id}`,
      );

      return;
    }

    if (dryRun) {
      this.logger.log(`Dry run: Creating favorite for view: ${workflowViewId}`);

      return;
    }

    await favoriteRepository.insert({
      viewId: workflowViewId,
      position: 5,
    });
  }

  private async seedView(
    workspaceId: string,
    nameSingular: string,
    viewName: string,
    dryRun = false,
  ): Promise<string> {
    const objectMetadata = (
      await this.objectMetadataRepository.find({
        where: { workspaceId, nameSingular },
      })
    )?.[0];

    if (!objectMetadata) {
      throw new Error(`Object metadata not found: ${nameSingular}`);
    }

    const fieldMetadataName = (
      await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          objectMetadataId: objectMetadata.id,
          name: 'name',
        },
      })
    )?.[0];

    if (!fieldMetadataName) {
      throw new Error(
        `Field metadata not found for ${objectMetadata.id}: name`,
      );
    }

    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'view',
      );

    const viewFieldRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'viewField',
      );

    const viewId = v4();

    const existingViews = await viewRepository.find({
      where: {
        objectMetadataId: objectMetadata.id,
        name: viewName,
      },
    });

    if (existingViews.length > 0) {
      this.logger.log(`View already exists: ${existingViews[0].id}`);

      return existingViews[0].id;
    }

    if (dryRun) {
      this.logger.log(`Dry run: Creating view: ${viewName}`);

      return viewId;
    }

    await viewRepository.insert({
      id: viewId,
      name: viewName,
      objectMetadataId: objectMetadata.id,
      type: 'table',
      key: 'INDEX',
      position: 0,
      icon: 'IconSettingsAutomation',
      kanbanFieldMetadataId: '',
    });

    await viewFieldRepository.insert({
      fieldMetadataId: fieldMetadataName.id,
      position: 0,
      isVisible: true,
      size: 210,
      viewId: viewId,
    });

    return viewId;
  }
}
