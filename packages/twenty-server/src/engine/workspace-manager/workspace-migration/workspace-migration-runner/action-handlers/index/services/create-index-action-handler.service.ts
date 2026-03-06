import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import {
  type FlatCreateIndexAction,
  type UniversalCreateIndexAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/index/types/workspace-migration-index-action';
import { fromUniversalFlatIndexToFlatIndex } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/from-universal-flat-index-to-flat-index.util';
import { createIndexInWorkspaceSchema } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'index',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalCreateIndexAction>,
  ): Promise<FlatCreateIndexAction> {
    const { action, allFlatEntityMaps, workspaceId, flatApplication } = context;

    const flatEntity = fromUniversalFlatIndexToFlatIndex({
      universalFlatIndexMetadata: action.flatEntity,
      indexMetadataId: action.id ?? v4(),
      allFlatEntityMaps,
      workspaceId,
      applicationId: flatApplication.id,
    });

    return {
      type: action.type,
      metadataName: action.metadataName,
      flatEntity,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity: flatIndexMetadata } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatIndexMetadata],
    });

    const indexFieldMetadataRepository = queryRunner.manager.getRepository(
      IndexFieldMetadataEntity,
    );

    await indexFieldMetadataRepository.insert(
      flatIndexMetadata.flatIndexFieldMetadatas,
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateIndexAction>,
  ): Promise<void> {
    const {
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      flatAction: { flatEntity: flatIndexMetadata },
      queryRunner,
      workspaceId,
    } = context;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatIndexMetadata.objectMetadataId,
    });

    await createIndexInWorkspaceSchema({
      flatIndexMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      queryRunner,
      workspaceId,
    });
  }
}
