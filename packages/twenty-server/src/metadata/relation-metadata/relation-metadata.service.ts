import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FindOneOptions, In, Repository } from 'typeorm';
import camelCase from 'lodash.camelcase';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { CreateRelationInput } from 'src/metadata/relation-metadata/dtos/create-relation.input';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { createCustomColumnName } from 'src/metadata/utils/create-custom-column-name.util';

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
    // TODO: This logic is duplicated with the BeforeDeleteOneRelation hook
    const relationMetadata = await this.relationMetadataRepository.findOne({
      where: { id },
      relations: ['fromFieldMetadata', 'toFieldMetadata'],
    });

    if (!relationMetadata) {
      throw new NotFoundException('Relation does not exist');
    }

    const deletedRelationMetadata = super.deleteOne(id);

    // TODO: Move to a cdc scheduler
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
    relationMetadataInput: CreateRelationInput,
  ): Promise<RelationMetadataEntity> {
    if (
      relationMetadataInput.relationType === RelationMetadataType.MANY_TO_MANY
    ) {
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
        relationMetadataInput.workspaceId,
        {
          where: {
            id: In([
              relationMetadataInput.fromObjectMetadataId,
              relationMetadataInput.toObjectMetadataId,
            ]),
          },
        },
      );

    const objectMetadataMap = objectMetadataEntries.reduce(
      (acc, curr) => {
        acc[curr.id] = curr;

        return acc;
      },
      {} as { [key: string]: ObjectMetadataEntity },
    );

    if (
      objectMetadataMap[relationMetadataInput.fromObjectMetadataId] ===
        undefined ||
      objectMetadataMap[relationMetadataInput.toObjectMetadataId] === undefined
    ) {
      throw new NotFoundException(
        'Can\t find an existing object matching fromObjectMetadataId or toObjectMetadataId',
      );
    }

    const baseColumnName = `${camelCase(relationMetadataInput.toName)}Id`;
    const isToCustom =
      objectMetadataMap[relationMetadataInput.toObjectMetadataId].isCustom;
    const foreignKeyColumnName = isToCustom
      ? createCustomColumnName(baseColumnName)
      : baseColumnName;

    const createdFields = await this.fieldMetadataService.createMany([
      // FROM
      {
        name: relationMetadataInput.fromName,
        label: relationMetadataInput.fromLabel,
        description: relationMetadataInput.fromDescription,
        icon: relationMetadataInput.fromIcon,
        isCustom: true,
        targetColumnMap: {},
        isActive: true,
        isNullable: true,
        type: FieldMetadataType.RELATION,
        objectMetadataId: relationMetadataInput.fromObjectMetadataId,
        workspaceId: relationMetadataInput.workspaceId,
      },
      // TO
      {
        name: relationMetadataInput.toName,
        label: relationMetadataInput.toLabel,
        description: relationMetadataInput.toDescription,
        icon: relationMetadataInput.toIcon,
        isCustom: true,
        targetColumnMap: {
          value: isToCustom
            ? createCustomColumnName(relationMetadataInput.toName)
            : relationMetadataInput.toName,
        },
        isActive: true,
        isNullable: true,
        type: FieldMetadataType.RELATION,
        objectMetadataId: relationMetadataInput.toObjectMetadataId,
        workspaceId: relationMetadataInput.workspaceId,
      },
      // FOREIGN KEY
      {
        name: baseColumnName,
        label: `${relationMetadataInput.toLabel} Foreign Key`,
        description: relationMetadataInput.toDescription
          ? `${relationMetadataInput.toDescription} Foreign Key`
          : undefined,
        icon: undefined,
        isCustom: true,
        targetColumnMap: {
          value: foreignKeyColumnName,
        },
        isActive: true,
        isNullable: true,
        // Should not be visible on the front side
        isSystem: true,
        type: FieldMetadataType.UUID,
        objectMetadataId: relationMetadataInput.toObjectMetadataId,
        workspaceId: relationMetadataInput.workspaceId,
      },
    ]);

    const createdFieldMap = createdFields.reduce((acc, fieldMetadata) => {
      if (fieldMetadata.type === FieldMetadataType.RELATION) {
        acc[fieldMetadata.name] = fieldMetadata;
      }

      return acc;
    }, {});

    const createdRelationMetadata = await super.createOne({
      ...relationMetadataInput,
      fromFieldMetadataId: createdFieldMap[relationMetadataInput.fromName].id,
      toFieldMetadataId: createdFieldMap[relationMetadataInput.toName].id,
    });

    await this.workspaceMigrationService.createCustomMigration(
      relationMetadataInput.workspaceId,
      [
        // Create the column
        {
          name: objectMetadataMap[relationMetadataInput.toObjectMetadataId]
            .targetTableName,
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName: foreignKeyColumnName,
              columnType: 'uuid',
              isNullable: true,
            },
          ],
        },
        // Create the foreignKey
        {
          name: objectMetadataMap[relationMetadataInput.toObjectMetadataId]
            .targetTableName,
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.RELATION,
              columnName: foreignKeyColumnName,
              referencedTableName:
                objectMetadataMap[relationMetadataInput.fromObjectMetadataId]
                  .targetTableName,
              referencedTableColumnName: 'id',
              isUnique:
                relationMetadataInput.relationType ===
                RelationMetadataType.ONE_TO_ONE,
            },
          ],
        },
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      relationMetadataInput.workspaceId,
    );

    return createdRelationMetadata;
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<RelationMetadataEntity>,
  ) {
    return this.relationMetadataRepository.findOne({
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
      relations: ['fromFieldMetadata', 'toFieldMetadata'],
    });
  }
}
