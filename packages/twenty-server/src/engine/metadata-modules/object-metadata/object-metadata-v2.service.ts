import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { fromCreateObjectInputToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-create-object-input-to-flat-object-metadata.util';
import { fromObjectMetadataMapsToFlatObjectMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-maps-to-flat-object-metadatas.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-migration-runner-v2.service';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataServiceV2 extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationBuilderV2: WorkspaceMigrationBuilderV2Service,
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
  ) {
    super(objectMetadataRepository);
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
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
    // @ts-expect-error TODO implement validateFlatObjectMetadata
    const createdFlatObjectMetadata = validateFlatObjectMetadata({
      existing:
        // Here we assume that EVERYTHING is in cache and up to date, this is very critical, also race condition prone :thinking:
        fromObjectMetadataMapsToFlatObjectMetadatas(objectMetadataMaps),
      toValidate: [createdRawFlatObjectMetadata],
    });

    const workspaceMigration = this.workspaceMigrationBuilderV2.build({
      objectMetadataFromToInputs: {
        from: existingFlatObjectMetadatas,
        to: [createdFlatObjectMetadata],
      },
      inferDeletionFromMissingObjectFieldIndex: false,
      workspaceId: objectMetadataInput.workspaceId,
    });

    await this.workspaceMigrationRunnerV2Service.run(workspaceMigration);

    return createdFlatObjectMetadata; // TODO retrieve from cache
  }
}
