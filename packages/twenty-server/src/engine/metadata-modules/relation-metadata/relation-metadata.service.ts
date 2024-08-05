import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import camelCase from 'lodash.camelcase';
import { FindOneOptions, In, Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { CreateRelationInput } from 'src/engine/metadata-modules/relation-metadata/dtos/create-relation.input';
import {
  RelationMetadataException,
  RelationMetadataExceptionCode,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.exception';
import {
  InvalidStringException,
  validateMetadataNameOrThrow,
} from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

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
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {
    super(relationMetadataRepository);
  }

  override async createOne(
    relationMetadataInput: CreateRelationInput,
  ): Promise<RelationMetadataEntity> {
    const objectMetadataMap = await this.getObjectMetadataMap(
      relationMetadataInput,
    );

    try {
      validateMetadataNameOrThrow(relationMetadataInput.fromName);
      validateMetadataNameOrThrow(relationMetadataInput.toName);
    } catch (error) {
      if (error instanceof InvalidStringException) {
        throw new RelationMetadataException(
          `Characters used in name "${relationMetadataInput.fromName}" or "${relationMetadataInput.toName}" are not supported`,
          RelationMetadataExceptionCode.INVALID_RELATION_INPUT,
        );
      } else {
        throw error;
      }
    }

    await this.validateCreateRelationMetadataInput(
      relationMetadataInput,
      objectMetadataMap,
    );

    // NOTE: this logic is called to create relation through metadata graphql endpoint (so only for custom field relations)
    const isCustom = true;
    const columnName = `${camelCase(relationMetadataInput.toName)}Id`;

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
      this.createForeignKeyFieldMetadata(relationMetadataInput, columnName),
    ]);

    const createdRelationMetadata = await super.createOne({
      ...relationMetadataInput,
      fromFieldMetadataId: fromId,
      toFieldMetadataId: toId,
    });

    await this.createWorkspaceCustomMigration(
      relationMetadataInput,
      objectMetadataMap,
      columnName,
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      relationMetadataInput.workspaceId,
    );

    await this.workspaceCacheVersionService.incrementVersion(
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
      throw new RelationMetadataException(
        'Many to many relations are not supported yet',
        RelationMetadataExceptionCode.INVALID_RELATION_INPUT,
      );
    }

    if (
      objectMetadataMap[relationMetadataInput.fromObjectMetadataId] ===
        undefined ||
      objectMetadataMap[relationMetadataInput.toObjectMetadataId] === undefined
    ) {
      throw new RelationMetadataException(
        'Can\t find an existing object matching with fromObjectMetadataId or toObjectMetadataId',
        RelationMetadataExceptionCode.RELATION_METADATA_NOT_FOUND,
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
      throw new RelationMetadataException(
        `Field on ${
          objectMetadataMap[
            relationMetadataInput[`${relationDirection}ObjectMetadataId`]
          ].nameSingular
        } already exists`,
        RelationMetadataExceptionCode.RELATION_ALREADY_EXISTS,
      );
    }
  }

  private async createWorkspaceCustomMigration(
    relationMetadataInput: CreateRelationInput,
    objectMetadataMap: { [key: string]: ObjectMetadataEntity },
    columnName: string,
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
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName,
              columnType: 'uuid',
              isNullable: true,
              defaultValue: null,
            },
          ],
        },
        // Create the foreignKey
        {
          name: computeObjectTargetTable(
            objectMetadataMap[relationMetadataInput.toObjectMetadataId],
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName,
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
      isCustom,
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
    columnName: string,
  ) {
    return {
      name: columnName,
      label: `${relationMetadataInput.toLabel} Foreign Key`,
      description: relationMetadataInput.toDescription
        ? `${relationMetadataInput.toDescription} Foreign Key`
        : undefined,
      icon: undefined,
      isCustom: true,
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

  public async deleteOneRelation(
    id: string,
    workspaceId: string,
  ): Promise<RelationMetadataEntity> {
    // TODO: This logic is duplicated with the BeforeDeleteOneRelation hook
    const relationMetadata = await this.relationMetadataRepository.findOne({
      where: { id },
      relations: [
        'fromFieldMetadata',
        'toFieldMetadata',
        'fromObjectMetadata',
        'toObjectMetadata',
      ],
    });

    if (!relationMetadata) {
      throw new RelationMetadataException(
        'Relation does not exist',
        RelationMetadataExceptionCode.RELATION_METADATA_NOT_FOUND,
      );
    }

    const foreignKeyFieldMetadataName = `${camelCase(
      relationMetadata.toFieldMetadata.name,
    )}Id`;

    const foreignKeyFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        name: foreignKeyFieldMetadataName,
        objectMetadataId: relationMetadata.toObjectMetadataId,
        workspaceId: relationMetadata.workspaceId,
      },
    });

    if (!foreignKeyFieldMetadata) {
      throw new RelationMetadataException(
        `Foreign key fieldMetadata not found (${foreignKeyFieldMetadataName}) for relation ${relationMetadata.id}`,
        RelationMetadataExceptionCode.FOREIGN_KEY_NOT_FOUND,
      );
    }

    await super.deleteOne(id);

    // TODO: Move to a cdc scheduler
    await this.fieldMetadataService.deleteMany({
      id: {
        in: [
          relationMetadata.fromFieldMetadataId,
          relationMetadata.toFieldMetadataId,
          foreignKeyFieldMetadata.id,
        ],
      },
    });

    const columnName = `${camelCase(relationMetadata.toFieldMetadata.name)}Id`;
    const objectTargetTable = computeObjectTargetTable(
      relationMetadata.toObjectMetadata,
    );

    await this.deleteRelationWorkspaceCustomMigration(
      relationMetadata,
      objectTargetTable,
      columnName,
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      relationMetadata.workspaceId,
    );

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

    // TODO: Return id for delete endpoints
    return relationMetadata;
  }

  async findManyRelationMetadataByFieldMetadataIds(
    fieldMetadataIds: string[],
  ): Promise<(RelationMetadataEntity | NotFoundException)[]> {
    const relationMetadataCollection =
      await this.relationMetadataRepository.find({
        where: [
          {
            fromFieldMetadataId: In(fieldMetadataIds),
          },
          {
            toFieldMetadataId: In(fieldMetadataIds),
          },
        ],
        relations: [
          'fromObjectMetadata',
          'toObjectMetadata',
          'fromFieldMetadata',
          'toFieldMetadata',
        ],
      });

    const mappedResult = fieldMetadataIds.map((fieldMetadataId) => {
      const foundRelationMetadataItem = relationMetadataCollection.find(
        (relationMetadataItem) =>
          relationMetadataItem.fromFieldMetadataId === fieldMetadataId ||
          relationMetadataItem.toFieldMetadataId === fieldMetadataId,
      );

      return (
        foundRelationMetadataItem ??
        // TODO: return a relation metadata not found exception
        new NotFoundException(
          `RelationMetadata with fieldMetadataId ${fieldMetadataId} not found`,
        )
      );
    });

    return mappedResult;
  }

  private async deleteRelationWorkspaceCustomMigration(
    relationMetadata: RelationMetadataEntity,
    objectTargetTable: string,
    columnName: string,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `delete-relation-from-${relationMetadata.fromObjectMetadata.nameSingular}-to-${relationMetadata.toObjectMetadata.nameSingular}`,
      ),
      relationMetadata.workspaceId,
      [
        // Delete the column
        {
          name: objectTargetTable,
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP,
              columnName,
            } satisfies WorkspaceMigrationColumnDrop,
          ],
        },
      ],
    );
  }
}
