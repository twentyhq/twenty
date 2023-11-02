import { Injectable } from '@nestjs/common';

import { FieldMetadataService } from 'src/metadata/field-metadata/services/field-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { standardObjectsMetadata } from 'src/metadata/standard-objects/standard-object-metadata';

@Injectable()
export class MetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  /**
   *
   * Create all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceMetadataId
   * @param workspaceId
   */
  public async createStandardObjectsAndFieldsMetadata(
    dataSourceMetadataId: string,
    workspaceId: string,
  ) {
    const createdObjectMetadata = await this.objectMetadataService.createMany(
      Object.values(standardObjectsMetadata).map((objectMetadata) => ({
        ...objectMetadata,
        dataSourceId: dataSourceMetadataId,
        fields: [],
        workspaceId,
        isCustom: false,
        isActive: true,
      })),
    );

    await this.fieldMetadataService.createMany(
      createdObjectMetadata.flatMap((objectMetadata: ObjectMetadata) =>
        standardObjectsMetadata[objectMetadata.nameSingular].fields.map(
          (field: FieldMetadata) => ({
            ...field,
            objectId: objectMetadata.id,
            dataSourceId: dataSourceMetadataId,
            workspaceId,
            isCustom: false,
            isActive: true,
          }),
        ),
      ),
    );
  }
}
