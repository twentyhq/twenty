import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { QueryRunner, Repository } from 'typeorm';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  TsVectorColumnActionFactory,
  TsVectorFieldMetadata,
} from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { SearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

@Injectable()
export class SearchVectorService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly tsVectorColumnActionFactory: TsVectorColumnActionFactory,
    private readonly indexMetadataService: IndexMetadataService,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  public async createSearchVectorFieldForObject(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
    queryRunner?: QueryRunner,
  ) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(FieldMetadataEntity)
      : this.fieldMetadataRepository;

    const searchVectorFieldMetadata = await repository.save({
      standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector,
      objectMetadataId: createdObjectMetadata.id,
      workspaceId: objectMetadataInput.workspaceId,
      isCustom: false,
      isActive: false,
      isSystem: true,
      type: FieldMetadataType.TS_VECTOR,
      name: SEARCH_VECTOR_FIELD.name,
      label: SEARCH_VECTOR_FIELD.label.message ?? '',
      description: SEARCH_VECTOR_FIELD.description.message ?? '',
      isNullable: true,
    });

    if (
      !isFieldMetadataEntityOfType(
        searchVectorFieldMetadata,
        FieldMetadataType.TS_VECTOR,
      )
    ) {
      throw new Error(
        'Should never occur, created searchVectorFieldMetadata is not a TS_VECTOR field',
      );
    }

    const searchableFieldForCustomObject =
      createdObjectMetadata.labelIdentifierFieldMetadataId
        ? createdObjectMetadata.fields.find(
            (field) =>
              field.id === createdObjectMetadata.labelIdentifierFieldMetadataId,
          )
        : createdObjectMetadata.fields.find(
            (field) => field.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
          );

    if (!isDefined(searchableFieldForCustomObject)) {
      throw new Error(
        `No searchable field found for custom object (object name: ${createdObjectMetadata.nameSingular})`,
      );
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeTableName(
            createdObjectMetadata.nameSingular,
            createdObjectMetadata.isCustom,
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: this.tsVectorColumnActionFactory.handleCreateAction({
            ...searchVectorFieldMetadata,
            generatedType: 'STORED',
            asExpression: getTsVectorColumnExpressionFromFields([
              {
                type: searchableFieldForCustomObject.type as SearchableFieldType,
                name: searchableFieldForCustomObject.name,
              },
            ]),
          }),
        },
      ],
      queryRunner,
    );

    await this.indexMetadataService.createIndexMetadata({
      workspaceId: objectMetadataInput.workspaceId,
      objectMetadata: createdObjectMetadata,
      fieldMetadataToIndex: [searchVectorFieldMetadata],
      isUnique: false,
      isCustom: false,
      indexType: IndexType.GIN,
      queryRunner,
    });
  }

  public async updateSearchVector(
    objectMetadataId: string,
    fieldMetadataNameAndTypeForSearch: FieldTypeAndNameMetadata[],
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(ObjectMetadataEntity)
      : this.objectMetadataRepository;

    const objectMetadata = await repository.findOneByOrFail({
      id: objectMetadataId,
    });

    const existingSearchVectorFieldMetadata =
      await this.fieldMetadataRepository.findOneByOrFail({
        name: SEARCH_VECTOR_FIELD.name,
        objectMetadataId,
      });

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`update-${objectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: computeTableName(
            objectMetadata.nameSingular,
            objectMetadata.isCustom,
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.ALTER,
            existingSearchVectorFieldMetadata,
            {
              ...existingSearchVectorFieldMetadata,
              asExpression: getTsVectorColumnExpressionFromFields(
                fieldMetadataNameAndTypeForSearch,
              ),
              generatedType: 'STORED', // Not stored on fieldMetadata
              options: null,
            } as TsVectorFieldMetadata,
          ),
        },
      ],
      queryRunner,
    );

    // index needs to be recreated as typeorm deletes then recreates searchVector column at alter
    await this.indexMetadataService.createIndexCreationMigration({
      workspaceId,
      objectMetadata,
      fieldMetadataToIndex: [existingSearchVectorFieldMetadata],
      isUnique: false,
      indexType: IndexType.GIN,
      queryRunner,
    });
  }
}
