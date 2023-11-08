import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Equal, In, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { DeleteOneOptions } from '@ptc-org/nestjs-query-core';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { standardObjectsMetadata } from 'src/metadata/standard-objects/standard-object-metadata';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadata> {
  constructor(
    @InjectRepository(ObjectMetadata, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadata>,

    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
  ) {
    super(objectMetadataRepository);
  }

  override async deleteOne(
    id: string,
    opts?: DeleteOneOptions<ObjectMetadata> | undefined,
  ): Promise<ObjectMetadata> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: { id },
    });

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    if (!objectMetadata.isCustom) {
      throw new BadRequestException("Standard Objects can't be deleted");
    }

    if (objectMetadata.isActive) {
      throw new BadRequestException("Active objects can't be deleted");
    }

    return super.deleteOne(id, opts);
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

  public async getObjectMetadataFromWorkspaceId(workspaceId: string) {
    return this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
    });
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

  public async findManyWithinWorkspace(
    objectMetadataIds: string[],
    workspaceId: string,
  ) {
    return this.objectMetadataRepository.findBy({
      id: In(objectMetadataIds),
      workspaceId: Equal(workspaceId),
    });
  }

  /**
   *
   * Create all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceMetadataId
   * @param workspaceId
   */
  public async createStandardObjectsAndFieldsMetadata(
    dataSourceMetadataId: string,
    workspaceId: string,
  ) {
    await this.objectMetadataRepository.save(
      Object.values(standardObjectsMetadata).map((objectMetadata) => ({
        ...objectMetadata,
        dataSourceId: dataSourceMetadataId,
        workspaceId,
        isCustom: false,
        isActive: true,
        fields: objectMetadata.fields.map((field) => ({
          ...field,
          workspaceId,
          isCustom: false,
          isActive: true,
        })),
      })),
    );
  }

  public async deleteObjectsAndFieldsMetadata(workspaceId: string) {
    await this.objectMetadataRepository.delete({ workspaceId });
  }
}
