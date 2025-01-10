import { Injectable } from '@nestjs/common';

import { capitalize, FieldMetadataType } from 'twenty-shared';

import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class SeederService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async seedCustomObjects(
    dataSourceId: string,
    workspaceId: string,
    objectMetadataSeed: ObjectMetadataSeed,
    objectRecordSeeds: Record<string, any>[],
  ): Promise<void> {
    const createdObjectMetadata = await this.objectMetadataService.createOne({
      ...objectMetadataSeed,
      dataSourceId,
      workspaceId,
    });

    if (!createdObjectMetadata) {
      throw new Error("Object metadata couldn't be created");
    }

    for (const fieldMetadataSeed of objectMetadataSeed.fields) {
      await this.fieldMetadataService.createOne({
        ...fieldMetadataSeed,
        objectMetadataId: createdObjectMetadata.id,
        workspaceId,
      });
    }

    const objectMetadataAfterFieldCreation =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectMetadataSeed.nameSingular },
      });

    if (!objectMetadataAfterFieldCreation) {
      throw new Error(
        "Object metadata couldn't be found after field creation.",
      );
    }

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const entityManager = workspaceDataSource.createEntityManager();

    const filteredFieldMetadataSeeds = objectMetadataSeed.fields.filter(
      (field) =>
        objectMetadataAfterFieldCreation.fields.some(
          (f) => f.name === field.name || f.name === `name`,
        ),
    );

    if (filteredFieldMetadataSeeds.length === 0) {
      throw new Error('No fields found for seeding, check metadata file');
    }

    this.addNameFieldToFieldMetadataSeeds(filteredFieldMetadataSeeds);

    const objectRecordSeedsAsSQLFlattenedSeeds = objectRecordSeeds.map(
      (recordSeed) => {
        const objectRecordSeedsAsSQLFlattenedSeeds = {};

        for (const field of filteredFieldMetadataSeeds) {
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
        `${schemaName}.${computeTableName(objectMetadataAfterFieldCreation.nameSingular, true)}`,
        sqlColumnNames,
      )
      .orIgnore()
      .values(sqlValues)
      .returning('*')
      .execute();
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

  private turnCompositeSubFieldValueAsSQLValue(
    fieldType: FieldMetadataType,
    subFieldName: string,
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
