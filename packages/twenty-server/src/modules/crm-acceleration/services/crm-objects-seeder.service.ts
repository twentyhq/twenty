import { Injectable, Logger } from '@nestjs/common';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import {
  CRM_OBJECT_SEEDS,
  type CrmObjectSeed,
} from 'src/modules/crm-acceleration/constants/crm-object-seeds.constant';

@Injectable()
export class CrmObjectsSeederService {
  private readonly logger = new Logger(CrmObjectsSeederService.name);

  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly dataSourceService: DataSourceService,
  ) {}

  async seedCrmObjects(workspaceId: string): Promise<void> {
    const dataSource =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    let created = 0;
    let skipped = 0;

    for (const objectSeed of CRM_OBJECT_SEEDS) {
      await this.seedObject({
        objectSeed,
        workspaceId,
        dataSourceId: dataSource.id,
      });
      const exists = await this.objectMetadataService.findOneWithinWorkspace(
        workspaceId,
        { where: { nameSingular: objectSeed.nameSingular } },
      );
      if (exists) {
        skipped++;
      } else {
        created++;
      }
    }

    this.logger.log(
      `CRM objects seeded for workspace ${workspaceId}: ${created} created, ${skipped} already existed`,
    );
  }

  private async seedObject({
    objectSeed,
    workspaceId,
    dataSourceId,
  }: {
    objectSeed: CrmObjectSeed;
    workspaceId: string;
    dataSourceId: string;
  }): Promise<void> {
    const existing = await this.objectMetadataService.findOneWithinWorkspace(
      workspaceId,
      { where: { nameSingular: objectSeed.nameSingular } },
    );

    if (existing) {
      this.logger.log(
        `Object ${objectSeed.nameSingular} already exists — skipping`,
      );
      return;
    }

    this.logger.log(`Creating object: ${objectSeed.labelSingular}`);

    await this.objectMetadataService.createOneObject({
      createObjectInput: {
        nameSingular: objectSeed.nameSingular,
        namePlural: objectSeed.namePlural,
        labelSingular: objectSeed.labelSingular,
        labelPlural: objectSeed.labelPlural,
        icon: objectSeed.icon,
        description: objectSeed.description,
        dataSourceId,
        isRemote: false,
      },
      workspaceId,
    });

    if (objectSeed.fields && objectSeed.fields.length > 0) {
      const created = await this.objectMetadataService.findOneWithinWorkspace(
        workspaceId,
        { where: { nameSingular: objectSeed.nameSingular } },
      );

      if (!created) {
        this.logger.warn(
          `Could not find just-created object ${objectSeed.nameSingular} to add fields`,
        );
        return;
      }

      await this.fieldMetadataService.createManyFields({
        createFieldInputs: objectSeed.fields.map((field) => ({
          ...field,
          objectMetadataId: created.id,
          workspaceId,
        })),
        workspaceId,
      });
    }
  }
}
