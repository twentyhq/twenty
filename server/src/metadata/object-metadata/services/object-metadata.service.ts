import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadata> {
  constructor(
    @InjectRepository(ObjectMetadata, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadata>,

    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
  ) {
    super(objectMetadataRepository, { useSoftDelete: true });
  }

  override async createOne(record: ObjectMetadata): Promise<ObjectMetadata> {
    const createdObjectMetadata = await super.createOne(record);

    await this.tenantMigrationService.createCustomMigration(
      createdObjectMetadata.workspaceId,
      [
        {
          name: createdObjectMetadata.targetTableName,
          action: 'create',
        } satisfies TenantMigrationTableAction,
      ],
    );

    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      createdObjectMetadata.workspaceId,
    );

    return createdObjectMetadata;
  }

  public async getObjectMetadataFromDataSourceId(dataSourceId: string) {
    return this.objectMetadataRepository.find({
      where: { dataSourceId },
      relations: ['fields'],
    });
  }

  public async findOneWithinWorkspace(
    objectMetadataId: string,
    workspaceId: string,
  ) {
    return this.objectMetadataRepository.findOne({
      where: { id: objectMetadataId, workspaceId },
    });
  }
}
