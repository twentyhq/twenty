import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { fromCreateObjectInputToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata.util';
import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationBuilderV2: WorkspaceMigrationBuilderV2Service,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
  ) {
    super(objectMetadataRepository);
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        objectMetadataInput.workspaceId,
      );

    if (!isWorkspaceMigrationV2Enabled) {
      throw new Error(
        'isWorkspaceMigrationV2Enabled false but createOne v2 has been called, should never occur',
      );
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        {
          workspaceId: objectMetadataInput.workspaceId,
        },
      );

    const createdRawFlatObjectMetadata =
      fromCreateObjectInputToFlatObjectMetadata(objectMetadataInput);
    const existingFlatObjectMetadatas =
      fromObjectMetadataMapsToFlatObjectMetadatas(objectMetadataMaps);
    // @ts-expect-error TODO implement validateFlatObjectMetadataData
    const createdFlatObjectMetadata = validateFlatObjectMetadataData({
      existing:
        // Here we assume that EVERYTHING is in cache and up to date, this is very critical, also race condition prone :thinking:
        fromObjectMetadataMapsToFlatObjectMetadatas(objectMetadataMaps),
      toValidate: [createdRawFlatObjectMetadata],
    });

    const workpsaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: existingFlatObjectMetadatas,
        to: [createdFlatObjectMetadata],
      },
      inferDeletionFromMissingObjectOrField: false,
      workspaceId: objectMetadataInput.workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workpsaceMigration);

    return createdFlatObjectMetadata; // TODO retrieve from cache
  }
}
