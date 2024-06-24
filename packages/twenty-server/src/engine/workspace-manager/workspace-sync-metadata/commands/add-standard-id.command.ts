import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';
import { computeStandardObject } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/compute-standard-object.util';
import { StandardFieldFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field.factory';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';

interface RunCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'workspace:add-standard-id',
  description: 'Add standard id to all metadata objects and fields',
})
export class AddStandardIdCommand extends CommandRunner {
  private readonly logger = new Logger(AddStandardIdCommand.name);

  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly standardFieldFactory: StandardFieldFactory,
  ) {
    super();
  }

  async run(_passedParam: string[], options: RunCommandOptions): Promise<void> {
    const queryRunner = this.metadataDataSource.createQueryRunner();
    const workspaceId = options.workspaceId;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    this.logger.log('Adding standardId to metadata objects and fields');

    try {
      const standardObjectMetadataCollection =
        this.standardObjectFactory.create(
          standardObjectMetadataDefinitions,
          {
            // We don't need to provide the workspace id and data source id as we're only adding standardId
            workspaceId: '',
            dataSourceId: '',
          },
          {
            IS_BLOCKLIST_ENABLED: true,
            IS_EVENT_OBJECT_ENABLED: true,
            IS_AIRTABLE_INTEGRATION_ENABLED: true,
            IS_POSTGRESQL_INTEGRATION_ENABLED: true,
            IS_STRIPE_INTEGRATION_ENABLED: false,
            IS_CONTACT_CREATION_FOR_SENT_AND_RECEIVED_EMAILS_ENABLED: true,
            IS_GOOGLE_CALENDAR_SYNC_V2_ENABLED: true,
          },
        );
      const standardFieldMetadataCollection = this.standardFieldFactory.create(
        CustomWorkspaceEntity,
        {
          workspaceId: '',
          dataSourceId: '',
        },
        {
          IS_BLOCKLIST_ENABLED: true,
          IS_EVENT_OBJECT_ENABLED: true,
          IS_AIRTABLE_INTEGRATION_ENABLED: true,
          IS_POSTGRESQL_INTEGRATION_ENABLED: true,
          IS_STRIPE_INTEGRATION_ENABLED: false,
          IS_CONTACT_CREATION_FOR_SENT_AND_RECEIVED_EMAILS_ENABLED: true,
          IS_GOOGLE_CALENDAR_SYNC_V2_ENABLED: true,
        },
      );

      const objectMetadataRepository =
        manager.getRepository(ObjectMetadataEntity);
      const fieldMetadataRepository =
        manager.getRepository(FieldMetadataEntity);

      /**
       * Update all object metadata with standard id
       */
      const updateObjectMetadataCollection: Partial<ObjectMetadataEntity>[] =
        [];
      const updateFieldMetadataCollection: Partial<FieldMetadataEntity>[] = [];
      const originalObjectMetadataCollection =
        await objectMetadataRepository.find({
          where: {
            fields: { isCustom: false },
            workspaceId: workspaceId,
          },
          relations: ['fields'],
        });
      const customObjectMetadataCollection =
        originalObjectMetadataCollection.filter(
          (metadata) => metadata.isCustom,
        );

      const standardObjectMetadataMap = new Map(
        standardObjectMetadataCollection.map((metadata) => [
          metadata.nameSingular,
          metadata,
        ]),
      );

      for (const originalObjectMetadata of originalObjectMetadataCollection) {
        const standardObjectMetadata = standardObjectMetadataMap.get(
          originalObjectMetadata.nameSingular,
        );

        if (!standardObjectMetadata && !originalObjectMetadata.isCustom) {
          continue;
        }

        const computedStandardObjectMetadata = computeStandardObject(
          standardObjectMetadata ?? {
            ...originalObjectMetadata,
            fields: standardFieldMetadataCollection,
          },
          originalObjectMetadata,
          customObjectMetadataCollection,
        );

        if (!originalObjectMetadata.isCustom) {
          updateObjectMetadataCollection.push({
            id: originalObjectMetadata.id,
            standardId: computedStandardObjectMetadata.standardId,
          });
        }

        for (const fieldMetadata of originalObjectMetadata.fields) {
          const standardFieldMetadata =
            computedStandardObjectMetadata.fields.find(
              (field) => field.name === fieldMetadata.name && !field.isCustom,
            );

          if (!standardFieldMetadata) {
            continue;
          }

          updateFieldMetadataCollection.push({
            id: fieldMetadata.id,
            standardId: standardFieldMetadata.standardId,
          });
        }
      }

      await objectMetadataRepository.save(updateObjectMetadataCollection);

      await fieldMetadataRepository.save(updateFieldMetadataCollection);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error adding standard id to metadata', error);
    } finally {
      await queryRunner.release();
    }
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
