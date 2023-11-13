import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { CreateRelationInput } from 'src/metadata/relation-metadata/dtos/create-relation.input';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { TenantMigrationColumnActionType } from 'src/metadata/tenant-migration/tenant-migration.entity';

import {
  RelationMetadataEntity,
  RelationMetadataType,
} from './relation-metadata.entity';

@Injectable()
export class RelationMetadataService extends TypeOrmQueryService<RelationMetadataEntity> {
  constructor(
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: TenantMigrationRunnerService,
  ) {
    super(relationMetadataRepository);
  }

  override async createOne(
    record: CreateRelationInput,
  ): Promise<RelationMetadataEntity> {
    if (record.relationType === RelationMetadataType.MANY_TO_MANY) {
      throw new BadRequestException(
        'Many to many relations are not supported yet',
      );
    }

    const objectMetadataEntries =
      await this.objectMetadataService.findManyWithinWorkspace(
        [record.fromObjectMetadataId, record.toObjectMetadataId],
        record.workspaceId,
      );

    const objectMetadataMap = objectMetadataEntries.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});

    if (
      objectMetadataMap[record.fromObjectMetadataId] === undefined ||
      objectMetadataMap[record.toObjectMetadataId] === undefined
    ) {
      throw new NotFoundException(
        'Can\t find an existing object matching fromObjectMetadataId or toObjectMetadataId',
      );
    }

    const createdFields = await this.fieldMetadataService.createMany([
      // FROM
      {
        name: record.fromName,
        label: record.fromLabel,
        description: record.description,
        icon: record.fromIcon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        type: FieldMetadataType.RELATION,
        objectMetadataId: record.fromObjectMetadataId,
        workspaceId: record.workspaceId,
      },
      // TO
      {
        name: record.toName,
        label: record.toLabel,
        description: undefined,
        icon: record.toIcon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        type: FieldMetadataType.RELATION,
        objectMetadataId: record.toObjectMetadataId,
        workspaceId: record.workspaceId,
      },
    ]);

    const createdFieldMap = createdFields.reduce((acc, curr) => {
      acc[curr.objectMetadataId] = curr;
      return acc;
    }, {});

    const createdRelationMetadata = await super.createOne({
      ...record,
      fromFieldMetadataId: createdFieldMap[record.fromObjectMetadataId].id,
      toFieldMetadataId: createdFieldMap[record.toObjectMetadataId].id,
    });

    const foreignKeyColumnName = `${
      objectMetadataMap[record.fromObjectMetadataId].targetTableName
    }Id`;

    await this.tenantMigrationService.createCustomMigration(
      record.workspaceId,
      [
        // Create the column
        {
          name: objectMetadataMap[record.toObjectMetadataId].targetTableName,
          action: 'alter',
          columns: [
            {
              action: TenantMigrationColumnActionType.CREATE,
              columnName: foreignKeyColumnName,
              columnType: 'uuid',
            },
          ],
        },
        // Create the foreignKey
        {
          name: objectMetadataMap[record.toObjectMetadataId].targetTableName,
          action: 'alter',
          columns: [
            {
              action: TenantMigrationColumnActionType.RELATION,
              columnName: foreignKeyColumnName,
              referencedTableName:
                objectMetadataMap[record.fromObjectMetadataId].targetTableName,
              referencedTableColumnName: 'id',
            },
          ],
        },
      ],
    );

    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    return createdRelationMetadata;
  }
}
