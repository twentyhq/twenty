import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FindOneOptions, In, Repository } from 'typeorm';
import camelCase from 'lodash.camelcase';
import { v4 as uuidV4 } from 'uuid';

import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { CreateRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/create-relation.input';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMigrationColumnActionType } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { createCustomColumnName } from 'src/engine/utils/create-custom-column-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { createRelationForeignKeyColumnName } from 'src/engine/metadata-modules/relation-metadata/utils/create-relation-foreign-key-column-name.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';

import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
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

  override async createOne(
    relationMetadataInput: CreateRelationInput,
  ): Promise<RelationMetadataEntity> {
    const objectMetadataMap = await this.getObjectMetadataMap(
      relationMetadataInput,
    );

    await this.validateCreateRelationMetadataInput(
      relationMetadataInput,
      objectMetadataMap,
    );

    // NOTE: this logic is called to create relation through metadata graphql endpoint (so only for custom field relations)
    const isCustom = true;
    const baseColumnName = `${camelCase(relationMetadataInput.toName)}Id`;
    const foreignKeyColumnName = createRelationForeignKeyColumnName(
      relationMetadataInput.toName,
      isCustom,
    );

    const fromId = uuidV4();
    const toId = uuidV4();

    await this.fieldMetadataService.createMany([
      this.createFieldMetadataForRelationMetadata(
        relationMetadataInput,
        'from',
        isCustom,
        fromId,
      ),
      this.createFieldMetadataForRelationMetadata(
        relationMetadataInput,
        'to',
        isCustom,
        toId,
      ),
      this.createForeignKeyFieldMetadata(
        relationMetadataInput,
        baseColumnName,
        foreignKeyColumnName,
      ),
    ]);

    const createdRelationMetadata = await super.createOne({
      ...relationMetadataInput,
      fromFieldMetadataId: fromId,
      toFieldMetadataId: toId,
    });

    await this.createWorkspaceCustomMigration(
      relationMetadataInput,
      objectMetadataMap,
      foreignKeyColumnName,
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      relationMetadataInput.workspaceId,
    );

    return createdRelationMetadata;
  }

  private async validateCreateRelationMetadataInput(
    relationMetadataInput: CreateRelationInput,
    objectMetadataMap: { [key: string]: ObjectMetadataEntity },
  ) {
    if (
      relationMetadataInput.relationType === RelationMetadataType.MANY_TO_MANY
    ) {
      throw new BadRequestException(
        'Many to many relations are not supported yet',
      );
    }

    if (
      objectMetadataMap[relationMetadataInput.fromObjectMetadataId] ===
        undefined ||
      objectMetadataMap[relationMetadataInput.toObjectMetadataId] === undefined
    ) {
      throw new NotFoundException(
        'Can\t find an existing object matching with fromObjectMetadataId or toObjectMetadataId',
      );
    }

    await this.checkIfFieldMetadataRelationNameExists(
      relationMetadataInput,
      objectMetadataMap,
      'from',
    );
    await this.checkIfFieldMetadataRelationNameExists(
      relationMetadataInput,
      objectMetadataMap,
      'to',
    );
  }

  private async checkIfFieldMetadataRelationNameExists(
    relationMetadataInput: CreateRelationInput,
    objectMetadataMap: { [key: string]: ObjectMetadataEntity },
    relationDirection: 'from' | 'to',
  ) {
    const fieldAlreadyExists =
      await this.fieldMetadataService.findOneWithinWorkspace(
        relationMetadataInput.workspaceId,
        {
          where: {
            name: relationMetadataInput[`${relationDirection}Name`],
            objectMetadataId:
              relationMetadataInput[`${relationDirection}ObjectMetadataId`],
          },
        },
      );

    if (fieldAlreadyExists) {
      throw new ConflictException(
        `Field on ${
          objectMetadataMap[
            relationMetadataInput[`${relationDirection}ObjectMetadataId`]
          ].nameSingular
        } already exists`,
      );
    }
  }

  private async createWorkspaceCustomMigration(
    relationMetadataInput: CreateRelationInput,
    objectMetadataMap: { [key: string]: ObjectMetadataEntity },
    foreignKeyColumnName: string,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${relationMetadataInput.fromName}`),
      relationMetadataInput.workspaceId,
      [
        // Create the column
        {
          name: computeObjectTargetTable(
            objectMetadataMap[relationMetadataInput.toObjectMetadataId],
          ),
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
          name: computeObjectTargetTable(
            objectMetadataMap[relationMetadataInput.toObjectMetadataId],
          ),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName: foreignKeyColumnName,
              referencedTableName: computeObjectTargetTable(
                objectMetadataMap[relationMetadataInput.fromObjectMetadataId],
              ),
              referencedTableColumnName: 'id',
              isUnique:
                relationMetadataInput.relationType ===
                RelationMetadataType.ONE_TO_ONE,
              onDelete: RelationOnDeleteAction.SET_NULL,
            },
          ],
        },
      ],
    );
  }

  private createFieldMetadataForRelationMetadata(
    relationMetadataInput: CreateRelationInput,
    relationDirection: 'from' | 'to',
    isCustom: boolean,
    id?: string,
  ) {
    return {
      ...(id && { id: id }),
      name: relationMetadataInput[`${relationDirection}Name`],
      label: relationMetadataInput[`${relationDirection}Label`],
      description: relationMetadataInput[`${relationDirection}Description`],
      icon: relationMetadataInput[`${relationDirection}Icon`],
      isCustom: true,
      targetColumnMap:
        relationDirection === 'to'
          ? isCustom
            ? createCustomColumnName(relationMetadataInput.toName)
            : relationMetadataInput.toName
          : {},
      isActive: true,
      isNullable: true,
      type: FieldMetadataType.RELATION,
      objectMetadataId:
        relationMetadataInput[`${relationDirection}ObjectMetadataId`],
      workspaceId: relationMetadataInput.workspaceId,
    };
  }

  private createForeignKeyFieldMetadata(
    relationMetadataInput: CreateRelationInput,
    baseColumnName: string,
    foreignKeyColumnName: string,
  ) {
    return {
      name: baseColumnName,
      label: `${relationMetadataInput.toLabel} Foreign Key`,
      description: relationMetadataInput.toDescription
        ? `${relationMetadataInput.toDescription} Foreign Key`
        : undefined,
      icon: undefined,
      isCustom: true,
      targetColumnMap: { value: foreignKeyColumnName },
      isActive: true,
      isNullable: true,
      isSystem: true,
      type: FieldMetadataType.UUID,
      objectMetadataId: relationMetadataInput.toObjectMetadataId,
      workspaceId: relationMetadataInput.workspaceId,
    };
  }

  private async getObjectMetadataMap(
    relationMetadataInput: CreateRelationInput,
  ): Promise<{ [key: string]: ObjectMetadataEntity }> {
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

    return objectMetadataEntries.reduce(
      (acc, curr) => {
        acc[curr.id] = curr;

        return acc;
      },
      {} as { [key: string]: ObjectMetadataEntity },
    );
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
}
