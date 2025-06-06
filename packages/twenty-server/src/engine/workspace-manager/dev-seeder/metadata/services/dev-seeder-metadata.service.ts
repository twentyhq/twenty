import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { PETS_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/pet-data-seeds.constant';
import { SURVEY_RESULTS_DATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/survey-result-data-seeds.constant';
import { seedWorkspaceWithDemoData } from 'src/engine/workspace-manager/dev-seeder/data/services/seed-dev-records.util';
import { PETS_METADATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/metadata-seeds/pets.metadata-seeds';
import { SURVEY_RESULTS_METADATA_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/metadata-seeds/survey-results.metadata-seeds';

@Injectable()
export class SeederService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  private async seedWorkspaceWithCustomObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
  ) {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    await seedWorkspaceWithDemoData(
      mainDataSource,
      dataSourceMetadata.schema,
      createdObjectMetadata,
    );

    await this.seederService.seedCustomObjects(
      dataSourceMetadata.id,
      workspaceId,
      PETS_METADATA_SEEDS,
    );

    await this.seederService.seedCustomObjectRecords(
      workspaceId,
      PETS_METADATA_SEEDS,
      PETS_DATA_SEEDS,
    );

    await this.seederService.seedCustomObjects(
      dataSourceMetadata.id,
      workspaceId,
      SURVEY_RESULTS_METADATA_SEEDS,
    );

    await this.seederService.seedCustomObjectRecords(
      workspaceId,
      SURVEY_RESULTS_METADATA_SEEDS,
      SURVEY_RESULTS_DATA_SEEDS,
    );
  }

  public async seedCustomObjectRecords(
    workspaceId: string,
    objectMetadataSeed: ObjectMetadataSeed,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectRecordSeeds: Record<string, any>[],
  ) {
    const { fieldMetadataSeeds, objectMetadata } = await this.getSeedMetadata(
      workspaceId,
      objectMetadataSeed,
    );

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const mainDataSource: DataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    const entityManager: EntityManager = mainDataSource.createEntityManager();

    const objectRecordSeedsAsSQLFlattenedSeeds = objectRecordSeeds.map(
      (recordSeed) => {
        const objectRecordSeedsAsSQLFlattenedSeeds = {};

        for (const field of fieldMetadataSeeds) {
          if (isCompositeFieldMetadataType(field.type)) {
            const compositeFieldTypeDefinition = compositeTypeDefinitions.get(
              field.type,
            );

            if (!isDefined(compositeFieldTypeDefinition)) {
              throw new Error(
                `Composite field type definition not found for ${field.type}`,
              );
            }

            const fieldNames = compositeFieldTypeDefinition.properties
              ?.map((property) => property.name)
              .filter(isDefined);

            for (const subFieldName of fieldNames) {
              const subFieldValue = recordSeed?.[field.name]?.[subFieldName];

              const subFieldValueAsSQLValue =
                this.turnCompositeSubFieldValueAsSQLValue(
                  field.type,
                  subFieldName,
                  subFieldValue,
                );

              const subFieldNameAsSQLColumnName = `${field.name}${capitalize(subFieldName)}`;

              // @ts-expect-error legacy noImplicitAny
              objectRecordSeedsAsSQLFlattenedSeeds[
                subFieldNameAsSQLColumnName
              ] = subFieldValueAsSQLValue;
            }
          } else {
            const fieldValue = recordSeed[field.name];

            const fieldValueAsSQLValue = this.turnFieldValueAsSQLValue(
              field.type,
              fieldValue,
            );

            // @ts-expect-error legacy noImplicitAny
            objectRecordSeedsAsSQLFlattenedSeeds[field.name] =
              fieldValueAsSQLValue;
          }
        }

        return objectRecordSeedsAsSQLFlattenedSeeds;
      },
    );

    if (!(objectRecordSeedsAsSQLFlattenedSeeds.length > 0)) {
      return;
    }

    const fieldMetadataNamesAsFlattenedSQLColumnNames = Object.keys(
      objectRecordSeedsAsSQLFlattenedSeeds[0],
    );

    const sqlColumnNames = [
      ...fieldMetadataNamesAsFlattenedSQLColumnNames,
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ];

    const sqlValues = objectRecordSeedsAsSQLFlattenedSeeds.map(
      (flattenedSeed, index) => ({
        ...flattenedSeed,
        position: index,
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        createdByName: 'Tim Apple',
      }),
    );

    await entityManager
      .createQueryBuilder()
      .insert()
      .into(
        `${schemaName}.${computeTableName(objectMetadata.nameSingular, true)}`,
        sqlColumnNames,
      )
      .orIgnore()
      .values(sqlValues)
      .returning('*')
      .execute();
  }

  public async seedCustomObjects(
    dataSourceId: string,
    workspaceId: string,
    objectMetadataSeed: ObjectMetadataSeed,
  ): Promise<void> {
    const createdObjectMetadata = await this.objectMetadataService.createOne({
      ...objectMetadataSeed,
      dataSourceId,
      workspaceId,
    });

    if (!createdObjectMetadata) {
      throw new Error("Object metadata couldn't be created");
    }

    await this.fieldMetadataService.createMany(
      objectMetadataSeed.fields.map((fieldMetadataSeed) => ({
        ...fieldMetadataSeed,
        objectMetadataId: createdObjectMetadata.id,
        workspaceId,
      })),
    );

    const { fieldMetadataSeeds } = await this.getSeedMetadata(
      workspaceId,
      objectMetadataSeed,
    );

    this.addNameFieldToFieldMetadataSeeds(fieldMetadataSeeds);
  }

  private addNameFieldToFieldMetadataSeeds(
    arrayOfMetadataFields: Pick<CreateFieldInput, 'name' | 'type' | 'label'>[],
  ) {
    arrayOfMetadataFields.unshift({
      name: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
    });
  }

  private async getSeedMetadata(
    workspaceId: string,
    objectMetadataSeed: ObjectMetadataSeed,
  ) {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectMetadataSeed.nameSingular },
      });

    if (!objectMetadata) {
      throw new Error(
        "Object metadata couldn't be found after field creation.",
      );
    }

    const fieldMetadataSeeds = objectMetadataSeed.fields.filter((field) =>
      objectMetadata.fields.some(
        (f) => f.name === field.name || f.name === `name`,
      ),
    );

    if (fieldMetadataSeeds.length === 0) {
      throw new Error('No fields found for seeding, check metadata file');
    }

    return { fieldMetadataSeeds, objectMetadata };
  }

  private turnCompositeSubFieldValueAsSQLValue(
    fieldType: FieldMetadataType,
    subFieldName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subFieldValue: any,
  ) {
    if (!isCompositeFieldMetadataType(fieldType)) {
      throw new Error(
        `${subFieldName} is not a sub field of a composite field type.`,
      );
    }

    const compositeFieldTypeDefinition =
      compositeTypeDefinitions.get(fieldType);

    const compositeSubFieldType =
      compositeFieldTypeDefinition?.properties.find(
        (property) => property.name === subFieldName,
      )?.type ?? null;

    if (!isDefined(compositeSubFieldType)) {
      throw new Error(
        `Cannot find ${subFieldName} in properties of composite type ${fieldType}.`,
      );
    }

    return this.turnFieldValueAsSQLValue(compositeSubFieldType, subFieldValue);
  }

  private turnFieldValueAsSQLValue(
    fieldType: FieldMetadataType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any,
  ) {
    if (fieldType === FieldMetadataType.RAW_JSON) {
      try {
        return JSON.stringify(fieldValue);
      } catch (error) {
        throw new Error(
          `Error while trying to turn field value as stringified JSON : ${error.message}`,
        );
      }
    }

    return fieldValue;
  }
}
