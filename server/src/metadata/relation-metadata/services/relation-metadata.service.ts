import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import {
  RelationMetadata,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/services/field-metadata.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { CreateRelationInput } from 'src/metadata/relation-metadata/dtos/create-relation.input';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantMigrationColumnActionType } from 'src/metadata/tenant-migration/tenant-migration.entity';

@Injectable()
export class RelationMetadataService extends TypeOrmQueryService<RelationMetadata> {
  constructor(
    @InjectRepository(RelationMetadata, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadata>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
  ) {
    super(relationMetadataRepository);
  }

  override async createOne(
    record: CreateRelationInput,
  ): Promise<RelationMetadata> {
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
      {
        name: record.name,
        label: record.label,
        description: record.description,
        icon: record.icon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        type: FieldMetadataType.RELATION,
        objectId: record.fromObjectMetadataId,
        workspaceId: record.workspaceId,
      },
      // NOTE: Since we have to create the field-metadata for the user, we need to use the toObjectMetadata info.
      // This is not ideal because we might see some conflicts with existing names.
      // NOTE2: Once MANY_TO_MANY is supported, we need to use namePlural/labelPlural instead.
      {
        name: objectMetadataMap[record.fromObjectMetadataId].nameSingular,
        label: objectMetadataMap[record.fromObjectMetadataId].labelSingular,
        description: undefined,
        icon: objectMetadataMap[record.fromObjectMetadataId].icon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        type: FieldMetadataType.RELATION,
        objectId: record.toObjectMetadataId,
        workspaceId: record.workspaceId,
      },
    ]);

    const createdFieldMap = createdFields.reduce((acc, curr) => {
      acc[curr.objectId] = curr;
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
