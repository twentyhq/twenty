import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildMigrationsToCreateRemoteTableRelations } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/utils/build-migrations-to-create-remote-table-relations.util';
import { buildMigrationsToRemoveRemoteTableRelations } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/utils/build-migrations-to-remove-remote-table-relations.util';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import {
  ATTACHMENT_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { createForeignKeyDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

@Injectable()
export class RemoteTableRelationsService {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  public async createForeignKeysMetadataAndMigrations(
    workspaceId: string,
    remoteObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType>
      | undefined,
    objectPrimaryKeyColumnType?: string,
  ) {
    const objectPrimaryKeyFieldType = mapUdtNameToFieldType(
      objectPrimaryKeyColumnType ?? 'uuid',
    );

    const favoriteObjectMetadata = await this.createFavoriteRelation(
      workspaceId,
      remoteObjectMetadata,
      objectPrimaryKeyFieldType,
      objectPrimaryKeyFieldSettings,
    );

    const attachmentObjectMetadata = await this.createAttachmentRelation(
      workspaceId,
      remoteObjectMetadata,
      objectPrimaryKeyFieldType,
      objectPrimaryKeyFieldSettings,
    );

    const timelineActivityObjectMetadata =
      await this.createTimelineActivityRelation(
        workspaceId,
        remoteObjectMetadata,
        objectPrimaryKeyFieldType,
        objectPrimaryKeyFieldSettings,
      );

    // create migration to add foreign key columns
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `add-foreign-keys-${remoteObjectMetadata.nameSingular}`,
      ),
      workspaceId,
      buildMigrationsToCreateRemoteTableRelations(
        remoteObjectMetadata.nameSingular,
        [
          favoriteObjectMetadata,
          attachmentObjectMetadata,
          timelineActivityObjectMetadata,
        ],
        objectPrimaryKeyColumnType ?? 'uuid',
      ),
    );
  }

  public async deleteForeignKeysMetadataAndCreateMigrations(
    workspaceId: string,
    remoteObjectMetadata: ObjectMetadataEntity,
  ) {
    // find favorite, activityTarget, attachment, timelineActivity objects
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    const timelineActivityObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'timelineActivity',
        workspaceId: workspaceId,
      });

    // compute the target column name
    const targetColumnName = `${remoteObjectMetadata.nameSingular}Id`;

    // find the foreign key fields to delete
    const foreignKeyFieldsToDelete = await this.fieldMetadataRepository.find({
      where: {
        name: targetColumnName,
        objectMetadataId: In([
          favoriteObjectMetadata.id,
          attachmentObjectMetadata.id,
          timelineActivityObjectMetadata.id,
        ]),
        workspaceId,
      },
    });

    const foreignKeyFieldsToDeleteIds = foreignKeyFieldsToDelete.map(
      (field) => field.id,
    );

    await this.fieldMetadataRepository.delete(foreignKeyFieldsToDeleteIds);

    // create migration to drop foreign key columns
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `delete-foreign-keys-${remoteObjectMetadata.nameSingular}`,
      ),
      workspaceId,
      buildMigrationsToRemoveRemoteTableRelations(targetColumnName, [
        favoriteObjectMetadata,
        attachmentObjectMetadata,
        timelineActivityObjectMetadata,
      ]),
    );
  }

  private async createAttachmentRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType>
      | undefined,
  ) {
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: attachmentObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Attachment ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        ...(isDefined(objectPrimaryKeyFieldSettings)
          ? {
              settings: {
                ...objectPrimaryKeyFieldSettings,
                isForeignKey: true,
              },
            }
          : {}),
      },
    );

    return attachmentObjectMetadata;
  }

  private async createTimelineActivityRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType>
      | undefined,
  ) {
    const timelineActivityObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'timelineActivity',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetCustom,
        }),
        objectMetadataId: timelineActivityObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Timeline Activity ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        ...(isDefined(objectPrimaryKeyFieldSettings)
          ? {
              settings: {
                ...objectPrimaryKeyFieldSettings,
                isForeignKey: true,
              },
            }
          : {}),
      },
    );

    return timelineActivityObjectMetadata;
  }

  private async createFavoriteRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType>
      | undefined,
  ) {
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: favoriteObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Favorite ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        ...(isDefined(objectPrimaryKeyFieldSettings)
          ? {
              settings: {
                ...objectPrimaryKeyFieldSettings,
                isForeignKey: true,
              },
            }
          : {}),
      },
    );

    return favoriteObjectMetadata;
  }
}
