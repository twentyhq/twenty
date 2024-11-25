import { Injectable } from '@nestjs/common';

import { ObjectSeed } from 'src/engine/seeder/interfaces/object-seed';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { capitalize } from 'src/utils/capitalize';
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
    metadataSeeds: ObjectSeed,
    dataSeeds: Record<string, any>[],
  ): Promise<void> {
    const objectMetadata = await this.objectMetadataService.createOne({
      ...metadataSeeds,
      dataSourceId,
      workspaceId,
    });

    // const objectMetadata =
    //   await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
    //     where: { nameSingular: metadataSeeds.nameSingular },
    //   });

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    for (const customField of metadataSeeds.fields) {
      await this.fieldMetadataService.createOne({
        ...customField,
        objectMetadataId: objectMetadata.id,
        workspaceId,
      });
    }

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    const entityManager = workspaceDataSource.createEntityManager();

    const filteredFields = metadataSeeds.fields.filter((field) =>
      objectMetadata.fields.some((f) => f.name === field.name),
    );

    const fieldMetadataMap = filteredFields
      .map((field) => {
        if (isCompositeFieldMetadataType(field.type)) {
          const compositeFieldTypeDefinition = compositeTypeDefinitions.get(
            field.type,
          );

          if (!isDefined(compositeFieldTypeDefinition)) {
            throw new Error(
              `Composite field type definition not found for ${field.type}`,
            );
          }

          const fieldNames = compositeFieldTypeDefinition.properties?.map(
            (property) => property.name,
          );

          return (
            fieldNames?.map(
              (subFieldName: string) =>
                `${field.name}${capitalize(subFieldName)}`,
            ) ?? []
          );
        } else {
          return field.name;
        }
      })
      .flat()
      .filter(isDefined);

    const flattenedSeeds = dataSeeds.map((seed) => {
      const flattenedSeed = {};

      for (const field of filteredFields) {
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
            flattenedSeed[`${field.name}${capitalize(subFieldName)}`] =
              seed[field.name][subFieldName];
          }
        } else {
          flattenedSeed[field.name] = seed[field.name];
        }
      }

      return flattenedSeed;
    });

    await entityManager
      .createQueryBuilder()
      .insert()
      .into(`${schemaName}._${objectMetadata.nameSingular}`, [
        ...fieldMetadataMap,
        'position',
      ])
      .orIgnore()
      .values(
        flattenedSeeds.map((flattenedSeed, index) => ({
          ...flattenedSeed,
          position: index,
        })),
      )
      .returning('*')
      .execute();
  }
}
