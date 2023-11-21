import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';
import camelCase from 'lodash.camelcase';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { CreateRelationInput } from 'src/metadata/relation-metadata/dtos/create-relation.input';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

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
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(relationMetadataRepository);
  }

  override async deleteOne(id: string): Promise<RelationMetadataEntity> {
    const relationMetadata = await this.relationMetadataRepository.findOne({
      where: { id },
      relations: ['fromFieldMetadata', 'toFieldMetadata'],
    });

    if (!relationMetadata) {
      throw new NotFoundException('Relation does not exist');
    }

    if (
      !relationMetadata.toFieldMetadata.isCustom ||
      !relationMetadata.fromFieldMetadata.isCustom
    ) {
      throw new BadRequestException("Standard Relations can't be deleted");
    }

    if (
      relationMetadata.toFieldMetadata.isActive ||
      relationMetadata.fromFieldMetadata.isActive
    ) {
      throw new BadRequestException("Active relations can't be deleted");
    }

    const deletedRelationMetadata = super.deleteOne(id);

    this.fieldMetadataService.deleteMany({
      id: {
        in: [
          relationMetadata.fromFieldMetadataId,
          relationMetadata.toFieldMetadataId,
        ],
      },
    });

    return deletedRelationMetadata;
  }

  override async createOne(
    record: CreateRelationInput,
  ): Promise<RelationMetadataEntity> {
    if (record.relationType === RelationMetadataType.MANY_TO_MANY) {
      throw new BadRequestException(
        'Many to many relations are not supported yet',
      );
    }

    /**
     * Relation types
     *
     * MANY TO MANY:
     * FROM Ǝ-E TO (NOT YET SUPPORTED)
     *
     * ONE TO MANY:
     * FROM --E TO (host the id in the TO table)
     *
     * ONE TO ONE:
     * FROM --- TO (host the id in the TO table)
     */

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

    const foreignKeyColumnName = `${camelCase(record.toName)}Id`;

    const createdFields = await this.fieldMetadataService.createMany([
      // FROM
      {
        name: record.fromName,
        label: record.fromLabel,
        description: record.fromDescription,
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
        description: record.toDescription,
        icon: record.toIcon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        type: FieldMetadataType.RELATION,
        objectMetadataId: record.toObjectMetadataId,
        workspaceId: record.workspaceId,
      },
      // FOREIGN KEY
      {
        name: foreignKeyColumnName,
        label: `${record.toLabel} Foreign Key`,
        description: undefined,
        icon: undefined,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        // Should not be visible on the front side
        isSystem: true,
        type: FieldMetadataType.UUID,
        objectMetadataId: record.toObjectMetadataId,
        workspaceId: record.workspaceId,
      },
    ]);

    const createdFieldMap = createdFields.reduce((acc, fieldMetadata) => {
      if (fieldMetadata.type === FieldMetadataType.RELATION) {
        acc[fieldMetadata.objectMetadataId] = fieldMetadata;
      }
      return acc;
    }, {});

    const createdRelationMetadata = await super.createOne({
      ...record,
      fromFieldMetadataId: createdFieldMap[record.fromObjectMetadataId].id,
      toFieldMetadataId: createdFieldMap[record.toObjectMetadataId].id,
    });

    await this.workspaceMigrationService.createCustomMigration(
      record.workspaceId,
      [
        // Create the column
        {
          name: objectMetadataMap[record.toObjectMetadataId].targetTableName,
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
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
              action: WorkspaceMigrationColumnActionType.RELATION,
              columnName: foreignKeyColumnName,
              referencedTableName:
                objectMetadataMap[record.fromObjectMetadataId].targetTableName,
              referencedTableColumnName: 'id',
              isUnique: record.relationType === RelationMetadataType.ONE_TO_ONE,
            },
          ],
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    return createdRelationMetadata;
  }
}
