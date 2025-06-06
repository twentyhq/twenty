import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class DevSeederDataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async seed(dataSourceMetadata: DataSourceEntity, workspaceId: string) {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Could not connect to main data source');
    }

    const createdObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);

    // await seedWorkspaceWithDemoData(
    //   mainDataSource,
    //   dataSourceMetadata.schema,
    //   createdObjectMetadata,
    // );
  }

  // public async seedCustomObjectRecords(
  //   workspaceId: string,
  //   objectMetadataSeed: ObjectMetadataSeed,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   objectRecordSeeds: Record<string, any>[],
  // ) {
  //   const schemaName =
  //     this.workspaceDataSourceService.getSchemaName(workspaceId);

  //   const mainDataSource: DataSource =
  //     await this.workspaceDataSourceService.connectToMainDataSource();

  //   const entityManager: EntityManager = mainDataSource.createEntityManager();

  //   const objectRecordSeedsAsSQLFlattenedSeeds = objectRecordSeeds.map(
  //     (recordSeed) => {
  //       const objectRecordSeedsAsSQLFlattenedSeeds = {};

  //       for (const field of fieldMetadataSeeds) {
  //         if (isCompositeFieldMetadataType(field.type)) {
  //           const compositeFieldTypeDefinition = compositeTypeDefinitions.get(
  //             field.type,
  //           );

  //           if (!isDefined(compositeFieldTypeDefinition)) {
  //             throw new Error(
  //               `Composite field type definition not found for ${field.type}`,
  //             );
  //           }

  //           const fieldNames = compositeFieldTypeDefinition.properties
  //             ?.map((property) => property.name)
  //             .filter(isDefined);

  //           for (const subFieldName of fieldNames) {
  //             const subFieldValue = recordSeed?.[field.name]?.[subFieldName];

  //             const subFieldValueAsSQLValue =
  //               this.turnCompositeSubFieldValueAsSQLValue(
  //                 field.type,
  //                 subFieldName,
  //                 subFieldValue,
  //               );

  //             const subFieldNameAsSQLColumnName = `${field.name}${capitalize(subFieldName)}`;

  //             // @ts-expect-error legacy noImplicitAny
  //             objectRecordSeedsAsSQLFlattenedSeeds[
  //               subFieldNameAsSQLColumnName
  //             ] = subFieldValueAsSQLValue;
  //           }
  //         } else {
  //           const fieldValue = recordSeed[field.name];

  //           const fieldValueAsSQLValue = this.turnFieldValueAsSQLValue(
  //             field.type,
  //             fieldValue,
  //           );

  //           // @ts-expect-error legacy noImplicitAny
  //           objectRecordSeedsAsSQLFlattenedSeeds[field.name] =
  //             fieldValueAsSQLValue;
  //         }
  //       }

  //       return objectRecordSeedsAsSQLFlattenedSeeds;
  //     },
  //   );

  //   if (!(objectRecordSeedsAsSQLFlattenedSeeds.length > 0)) {
  //     return;
  //   }

  //   const fieldMetadataNamesAsFlattenedSQLColumnNames = Object.keys(
  //     objectRecordSeedsAsSQLFlattenedSeeds[0],
  //   );

  //   const sqlColumnNames = [
  //     ...fieldMetadataNamesAsFlattenedSQLColumnNames,
  //     'position',
  //     'createdBySource',
  //     'createdByWorkspaceMemberId',
  //     'createdByName',
  //   ];

  //   const sqlValues = objectRecordSeedsAsSQLFlattenedSeeds.map(
  //     (flattenedSeed, index) => ({
  //       ...flattenedSeed,
  //       position: index,
  //       createdBySource: 'MANUAL',
  //       createdByWorkspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
  //       createdByName: 'Tim Apple',
  //     }),
  //   );

  //   await entityManager
  //     .createQueryBuilder()
  //     .insert()
  //     .into(
  //       `${schemaName}.${computeTableName(objectMetadata.nameSingular, true)}`,
  //       sqlColumnNames,
  //     )
  //     .orIgnore()
  //     .values(sqlValues)
  //     .returning('*')
  //     .execute();
  // }

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

  // seedWorkspaceWithDemoData = async (
  //   workspaceDataSource: DataSource,
  //   schemaName: string,
  //   objectMetadata: ObjectMetadataEntity[],
  // ) => {
  //   const objectMetadataMap = objectMetadata.reduce((acc, object) => {
  //     // @ts-expect-error legacy noImplicitAny
  //     acc[object.standardId ?? ''] = {
  //       id: object.id,
  //       fields: object.fields.reduce((acc, field) => {
  //         // @ts-expect-error legacy noImplicitAny
  //         acc[field.standardId ?? ''] = field.id;

  //         return acc;
  //       }, {}),
  //     };

  //     return acc;
  //   }, {});

  //   await workspaceDataSource.transaction(
  //     async (entityManager: WorkspaceEntityManager) => {
  //       await seedCompanyWithDemoData(entityManager, schemaName);
  //       await seedPersonWithDemoData(entityManager, schemaName);
  //       await seedOpportunityWithDemoData(entityManager, schemaName);

  //       const viewDefinitionsWithId = await seedViewWithDemoData(
  //         entityManager,
  //         schemaName,
  //         objectMetadataMap,
  //       );

  //       await seedWorkspaceFavorites(
  //         viewDefinitionsWithId
  //           .filter(
  //             (view) =>
  //               view.key === 'INDEX' &&
  //               shouldSeedWorkspaceFavorite(
  //                 view.objectMetadataId,
  //                 objectMetadataMap,
  //               ),
  //           )
  //           .map((view) => view.id),
  //         entityManager,
  //         schemaName,
  //       );
  //       await seedWorkspaceMemberWithDemoData(entityManager, schemaName);
  //     },
  //   );
  // };

  // async seedRecords({
  //   mainDataSource,
  //   dataSourceMetadata,
  // }: {
  //   mainDataSource: DataSource;
  //   dataSourceMetadata: DataSourceEntity;
  // }) {
  //   await this.seedStandardObjectRecords(mainDataSource, dataSourceMetadata);

  //   await this.seederService.seedCustomObjectRecords(
  //     dataSourceMetadata.workspaceId,
  //     PETS_METADATA_SEEDS,
  //     PETS_DATA_SEEDS,
  //   );

  //   await this.seederService.seedCustomObjectRecords(
  //     dataSourceMetadata.workspaceId,
  //     SURVEY_RESULTS_METADATA_SEEDS,
  //     SURVEY_RESULTS_DATA_SEEDS,
  //   );
  // }

  // async seedStandardObjectRecords(
  //   mainDataSource: DataSource,
  //   dataSourceMetadata: DataSourceEntity,
  // ) {
  //   await mainDataSource.transaction(
  //     async (entityManager: WorkspaceEntityManager) => {
  //       const { objectMetadataStandardIdToIdMap } =
  //         await this.objectMetadataService.getObjectMetadataStandardIdToIdMap(
  //           dataSourceMetadata.workspaceId,
  //         );

  //       await seedCompanies(entityManager, dataSourceMetadata.schema);
  //       await seedPeople(entityManager, dataSourceMetadata.schema);
  //       await seedOpportunity(entityManager, dataSourceMetadata.schema);
  //       await seedWorkspaceMember(
  //         entityManager,
  //         dataSourceMetadata.schema,
  //         dataSourceMetadata.workspaceId,
  //       );

  //       if (dataSourceMetadata.workspaceId === SEED_APPLE_WORKSPACE_ID) {
  //         await seedApiKey(entityManager, dataSourceMetadata.schema);
  //         await seedMessageThread(entityManager, dataSourceMetadata.schema);
  //         await seedConnectedAccount(entityManager, dataSourceMetadata.schema);

  //         await seedMessage(entityManager, dataSourceMetadata.schema);
  //         await seedMessageChannel(entityManager, dataSourceMetadata.schema);
  //         await seedMessageChannelMessageAssociation(
  //           entityManager,
  //           dataSourceMetadata.schema,
  //         );
  //         await seedMessageParticipant(
  //           entityManager,
  //           dataSourceMetadata.schema,
  //         );

  //         await seedCalendarEvents(entityManager, dataSourceMetadata.schema);
  //         await seedCalendarChannels(entityManager, dataSourceMetadata.schema);
  //         await seedCalendarChannelEventAssociations(
  //           entityManager,
  //           dataSourceMetadata.schema,
  //         );
  //         await seedCalendarEventParticipants(
  //           entityManager,
  //           dataSourceMetadata.schema,
  //         );
  //       }

  //       const viewDefinitionsWithId = await seedViewWithDemoData(
  //         entityManager,
  //         dataSourceMetadata.schema,
  //         objectMetadataStandardIdToIdMap,
  //       );

  //       const devViewDefinitionsWithId = await createWorkspaceViews(
  //         entityManager,
  //         dataSourceMetadata.schema,
  //         [opportunitiesTableByStageView(objectMetadataStandardIdToIdMap)],
  //       );

  //       viewDefinitionsWithId.push(...devViewDefinitionsWithId);

  //       await seedWorkspaceFavorites(
  //         viewDefinitionsWithId
  //           .filter(
  //             (view) =>
  //               view.key === 'INDEX' &&
  //               shouldSeedWorkspaceFavorite(
  //                 view.objectMetadataId,
  //                 objectMetadataStandardIdToIdMap,
  //               ),
  //           )
  //           .map((view) => view.id),
  //         entityManager,
  //         dataSourceMetadata.schema,
  //       );
  //     },
  //   );
  // }
}
