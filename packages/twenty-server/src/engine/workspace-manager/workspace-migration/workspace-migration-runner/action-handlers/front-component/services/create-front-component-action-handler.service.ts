import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import {
  FlatCreateFrontComponentAction,
  UniversalCreateFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateFrontComponentActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'frontComponent',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateFrontComponentAction>): Promise<FlatCreateFrontComponentAction> {
    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFrontComponentAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId, flatApplication } = context;
    const { flatEntity: frontComponent } = flatAction;

    const applicationUniversalIdentifier = flatApplication.universalIdentifier;

    if (isDefined(frontComponent.builtComponentChecksum)) {
      await this.verifySourceAndBuiltFilesExist({
        workspaceId,
        applicationUniversalIdentifier,
        builtComponentPath: frontComponent.builtComponentPath,
      });
    }

    const frontComponentRepository =
      queryRunner.manager.getRepository<FrontComponentEntity>(
        FrontComponentEntity,
      );

    await frontComponentRepository.insert({
      ...frontComponent,
      workspaceId,
    });
  }

  private async verifySourceAndBuiltFilesExist({
    workspaceId,
    applicationUniversalIdentifier,
    builtComponentPath,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    builtComponentPath: string;
  }): Promise<void> {
    const builtExists = await this.fileStorageService.checkFileExists({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: builtComponentPath,
    });

    if (!builtExists) {
      throw new FrontComponentException(
        `Front component built file missing before create (built: ${builtExists})`,
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateFrontComponentAction>,
  ): Promise<void> {
    return;
  }
}
