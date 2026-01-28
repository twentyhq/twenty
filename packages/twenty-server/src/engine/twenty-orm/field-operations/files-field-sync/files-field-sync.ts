import path from 'path';

import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  type FieldMetadataSettingsMapping,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  In,
  type EntityTarget,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { getObjectMetadataFromEntityTarget } from 'src/engine/twenty-orm/utils/get-object-metadata-from-entity-target.util';

type FileItem = {
  fileId: string;
  label: string;
  extension?: string;
};

type FilesFieldDiff = {
  toAdd: FileItem[];
  toUpdate: FileItem[];
  toRemove: FileItem[];
};

type FilesFieldDiffByEntityIndex = {
  [entityIndex: number]: {
    [fieldName: string]: FilesFieldDiff;
  };
};

export class FilesFieldSync {
  private readonly internalContext: WorkspaceInternalContext;
  private readonly fileRepository: Repository<FileEntity>;

  constructor(internalContext: WorkspaceInternalContext) {
    this.internalContext = internalContext;
    this.fileRepository =
      internalContext.coreDataSource.getRepository(FileEntity);
  }

  prepareFilesFieldSyncBeforeUpdate<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntity<Entity>[],
    target: EntityTarget<Entity>,
    existingRecords: ObjectLiteral[],
  ): FilesFieldDiffByEntityIndex | null {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const filesFields = this.getFilesFields(objectMetadata.id);

    if (filesFields.length === 0) {
      return null;
    }

    const filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex = {};

    entities.forEach((entity, index) => {
      const entityWithId = entity as { id?: string };
      const existingRecord = existingRecords?.find(
        (existing) =>
          isDefined(existing.id) &&
          isDefined(entityWithId.id) &&
          existing.id === entityWithId.id,
      );

      for (const filesField of filesFields) {
        const entityAny = entity as Record<string, unknown>;
        const newFilesValue = entityAny[filesField.name] as
          | FileItem[]
          | null
          | undefined;

        if (!isDefined(newFilesValue)) {
          continue;
        }

        const filesFieldMaxNumberOfValues = (
          filesField.settings as FieldMetadataSettingsMapping[FieldMetadataType.FILES]
        ).maxNumberOfValues;

        if (newFilesValue.length > filesFieldMaxNumberOfValues) {
          throw new TwentyORMException(
            `Max number of files is ${filesFieldMaxNumberOfValues}`,
            TwentyORMExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`Max number of files is ${filesFieldMaxNumberOfValues}`,
            },
          );
        }

        const existingFilesValue = (existingRecord?.[filesField.name] ??
          []) as FileItem[];

        const diff = this.computeFilesFieldDiff(
          existingFilesValue,
          newFilesValue,
        );

        if (
          diff.toAdd.length > 0 ||
          diff.toUpdate.length > 0 ||
          diff.toRemove.length > 0
        ) {
          if (!filesFieldDiffByEntityIndex[index]) {
            filesFieldDiffByEntityIndex[index] = {};
          }
          filesFieldDiffByEntityIndex[index][filesField.name] = diff;
        }
      }
    });

    return Object.keys(filesFieldDiffByEntityIndex).length > 0
      ? filesFieldDiffByEntityIndex
      : null;
  }

  prepareFilesFieldSyncBeforeUpdateOne<Entity extends ObjectLiteral>(
    updatePayload: QueryDeepPartialEntity<Entity>,
    target: EntityTarget<Entity>,
    existingRecords: ObjectLiteral[],
  ): FilesFieldDiffByEntityIndex | null {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const filesFields = this.getFilesFields(objectMetadata.id);

    if (filesFields.length === 0) {
      return null;
    }

    const filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex = {};

    for (const filesField of filesFields) {
      const updatePayloadAny = updatePayload as Record<string, unknown>;
      const newFilesValue = updatePayloadAny[filesField.name] as
        | FileItem[]
        | null
        | undefined;

      if (!isDefined(newFilesValue)) {
        continue;
      }

      const filesFieldMaxNumberOfValues = (
        filesField.settings as FieldMetadataSettingsMapping[FieldMetadataType.FILES]
      ).maxNumberOfValues;

      if (newFilesValue.length > filesFieldMaxNumberOfValues) {
        throw new TwentyORMException(
          `Max number of files is ${filesFieldMaxNumberOfValues}`,
          TwentyORMExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Max number of files is ${filesFieldMaxNumberOfValues}`,
          },
        );
      }

      if (existingRecords.length !== 1) {
        throw new TwentyORMException(
          `Cannot update multiple records with files field at once`,
          TwentyORMExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`You can only update one record with files field at once.`,
          },
        );
      }

      const existingRecord = existingRecords[0];
      const existingFilesValue = (existingRecord?.[filesField.name] ??
        []) as FileItem[];

      const diff = this.computeFilesFieldDiff(
        existingFilesValue,
        newFilesValue,
      );

      if (
        diff.toAdd.length > 0 ||
        diff.toUpdate.length > 0 ||
        diff.toRemove.length > 0
      ) {
        if (!filesFieldDiffByEntityIndex[0]) {
          filesFieldDiffByEntityIndex[0] = {};
        }
        filesFieldDiffByEntityIndex[0][filesField.name] = diff;
      }
    }

    return Object.keys(filesFieldDiffByEntityIndex).length > 0
      ? filesFieldDiffByEntityIndex
      : null;
  }

  prepareFilesFieldSyncBeforeInsert<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntity<Entity>[],
    target: EntityTarget<Entity>,
  ): FilesFieldDiffByEntityIndex | null {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const filesFields = this.getFilesFields(objectMetadata.id);

    if (filesFields.length === 0) {
      return null;
    }

    const filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex = {};

    entities.forEach((entity, index) => {
      for (const filesField of filesFields) {
        const entityAny = entity as Record<string, unknown>;
        const newFilesValue = entityAny[filesField.name] as
          | FileItem[]
          | null
          | undefined;

        if (!isDefined(newFilesValue)) {
          continue;
        }

        const filesFieldMaxNumberOfValues = (
          filesField.settings as FieldMetadataSettingsMapping[FieldMetadataType.FILES]
        ).maxNumberOfValues;

        if (newFilesValue.length > filesFieldMaxNumberOfValues) {
          throw new TwentyORMException(
            `Max number of files is ${filesFieldMaxNumberOfValues}`,
            TwentyORMExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`Max number of files is ${filesFieldMaxNumberOfValues}`,
            },
          );
        }

        const diff = this.computeFilesFieldDiff([], newFilesValue);

        if (diff.toAdd.length > 0) {
          if (!filesFieldDiffByEntityIndex[index]) {
            filesFieldDiffByEntityIndex[index] = {};
          }
          filesFieldDiffByEntityIndex[index][filesField.name] = diff;
        }
      }
    });

    return Object.keys(filesFieldDiffByEntityIndex).length > 0
      ? filesFieldDiffByEntityIndex
      : null;
  }

  prepareFilesFieldSyncBeforeUpsert<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntity<Entity>[],
    target: EntityTarget<Entity>,
    existingRecordsMapById: Record<string, ObjectLiteral>,
  ): FilesFieldDiffByEntityIndex | null {
    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const filesFields = this.getFilesFields(objectMetadata.id);

    if (filesFields.length === 0) {
      return null;
    }

    const filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex = {};

    entities.forEach((entity, index) => {
      const entityWithId = entity as { id?: string };
      const existingRecord = isDefined(entityWithId.id)
        ? existingRecordsMapById[entityWithId.id]
        : undefined;

      for (const filesField of filesFields) {
        const entityAny = entity as Record<string, unknown>;
        const newFilesValue = entityAny[filesField.name] as
          | FileItem[]
          | null
          | undefined;

        if (!isDefined(newFilesValue)) {
          continue;
        }

        const existingFilesValue = existingRecord
          ? ((existingRecord[filesField.name] ?? []) as FileItem[])
          : [];

        const diff = this.computeFilesFieldDiff(
          existingFilesValue,
          newFilesValue,
        );

        if (
          diff.toAdd.length > 0 ||
          diff.toUpdate.length > 0 ||
          diff.toRemove.length > 0
        ) {
          if (!filesFieldDiffByEntityIndex[index]) {
            filesFieldDiffByEntityIndex[index] = {};
          }
          filesFieldDiffByEntityIndex[index][filesField.name] = diff;
        }
      }
    });

    return Object.keys(filesFieldDiffByEntityIndex).length > 0
      ? filesFieldDiffByEntityIndex
      : null;
  }

  private computeFilesFieldDiff(
    existingFiles: FileItem[],
    newFiles: FileItem[],
  ): FilesFieldDiff {
    const existingFileMap = new Map(
      existingFiles.map((file) => [file.fileId, file]),
    );
    const newFileMap = new Map(newFiles.map((file) => [file.fileId, file]));

    const toAdd: FileItem[] = [];
    const toUpdate: FileItem[] = [];
    const toRemove: FileItem[] = [];

    for (const newFile of newFiles) {
      const existingFile = existingFileMap.get(newFile.fileId);

      if (!isDefined(existingFile)) {
        toAdd.push(newFile);
      } else {
        toUpdate.push(newFile);
      }
    }

    for (const existingFile of existingFiles) {
      if (!newFileMap.has(existingFile.fileId)) {
        toRemove.push(existingFile);
      }
    }

    return { toAdd, toUpdate, toRemove };
  }

  async enrichFilesFields<Entity extends ObjectLiteral>({
    entities,
    filesFieldDiffByEntityIndex,
    workspaceId,
  }: {
    entities: QueryDeepPartialEntity<Entity>[];
    filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex;
    workspaceId: string;
  }): Promise<{
    entities: QueryDeepPartialEntity<Entity>[];
    fileIds: {
      toAdd: Set<string>;
      toUpdate: Set<string>;
      toRemove: Set<string>;
    };
  }> {
    if (Object.keys(filesFieldDiffByEntityIndex).length === 0) {
      return {
        entities,
        fileIds: {
          toAdd: new Set<string>(),
          toUpdate: new Set<string>(),
          toRemove: new Set<string>(),
        },
      };
    }

    const fileIds = await this.validateAndEnrichFileDiffs(
      filesFieldDiffByEntityIndex,
      workspaceId,
    );

    const updatedEntities = this.updateEntitiesWithFileChanges(
      entities,
      filesFieldDiffByEntityIndex,
    );

    return {
      entities: updatedEntities,
      fileIds,
    };
  }

  private async validateAndEnrichFileDiffs(
    filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex,
    workspaceId: string,
  ): Promise<{
    toAdd: Set<string>;
    toUpdate: Set<string>;
    toRemove: Set<string>;
  }> {
    const allFileIds = {
      toAdd: new Set<string>(),
      toUpdate: new Set<string>(),
      toRemove: new Set<string>(),
    };

    const allFileIdsToFetch = new Set<string>();

    for (const entityDiffs of Object.values(filesFieldDiffByEntityIndex)) {
      for (const diff of Object.values(entityDiffs)) {
        diff.toAdd.forEach((file) => {
          allFileIds.toAdd.add(file.fileId);
          allFileIdsToFetch.add(file.fileId);
        });
        diff.toUpdate.forEach((file) => {
          allFileIds.toUpdate.add(file.fileId);
          allFileIdsToFetch.add(file.fileId);
        });
        diff.toRemove.forEach((file) => {
          allFileIds.toRemove.add(file.fileId);
        });
      }
    }

    if (allFileIdsToFetch.size === 0 && allFileIds.toRemove.size === 0) {
      return allFileIds;
    }

    const existingFiles = await this.fileRepository.find({
      where: {
        id: In([...allFileIdsToFetch, ...allFileIds.toRemove]),
        workspaceId,
      },
      select: ['id', 'path', 'info'],
    });

    const existingFileMap = new Map(
      existingFiles.map((file) => [file.id, file]),
    );

    for (const entityDiffs of Object.values(filesFieldDiffByEntityIndex)) {
      for (const diff of Object.values(entityDiffs)) {
        for (const file of diff.toAdd) {
          const fileEntity = existingFileMap.get(file.fileId);

          if (!fileEntity) {
            throw new TwentyORMException(
              `File not found: ${file.fileId}`,
              TwentyORMExceptionCode.INVALID_INPUT,
            );
          }

          if (!fileEntity.info?.isTemporaryFile) {
            const fileId = file.fileId;

            throw new TwentyORMException(
              `File ${fileId} is already associated with a permanent files field`,
              TwentyORMExceptionCode.INVALID_INPUT,
              {
                userFriendlyMessage: msg`File ${fileId} is already associated with a permanent files field. Please re-upload the file.`,
              },
            );
          }

          file.extension = path.extname(fileEntity.path);
        }

        for (const file of diff.toUpdate) {
          const fileEntity = existingFileMap.get(file.fileId);

          if (!fileEntity) {
            throw new TwentyORMException(
              `File not found: ${file.fileId}`,
              TwentyORMExceptionCode.INVALID_INPUT,
            );
          }

          if (fileEntity.info?.isTemporaryFile) {
            throw new TwentyORMException(
              `File ${file.fileId} to update should not be a temporary file`,
              TwentyORMExceptionCode.INVALID_INPUT,
              {
                userFriendlyMessage: STANDARD_ERROR_MESSAGE,
              },
            );
          }

          file.extension = path.extname(fileEntity.path);
        }
      }
    }

    return allFileIds;
  }

  ///TODODO should update applicationId
  async updateFileEntityRecords(fileIds: {
    toAdd: Set<string>;
    toUpdate: Set<string>;
    toRemove: Set<string>;
  }): Promise<void> {
    if (fileIds.toAdd.size > 0) {
      await this.fileRepository
        .createQueryBuilder()
        .update()
        .set({
          info: () => `jsonb_set(info, '{isTemporaryFile}', 'false')`,
        })
        .where('id IN (:...ids)', { ids: [...fileIds.toAdd] })
        .execute();
    }

    if (fileIds.toRemove.size > 0) {
      await this.fileRepository.softDelete([...fileIds.toRemove]);
    }
  }

  private updateEntitiesWithFileChanges<Entity extends ObjectLiteral>(
    entities: QueryDeepPartialEntity<Entity>[],
    filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex,
  ): QueryDeepPartialEntity<Entity>[] {
    return entities.map((entity, index) => {
      const entityDiffs = filesFieldDiffByEntityIndex[index];

      if (!entityDiffs) {
        return entity;
      }

      const updatedEntity = { ...entity };
      const updatedEntityAny = updatedEntity as Record<string, unknown>;

      for (const [fieldName, diff] of Object.entries(entityDiffs)) {
        const entityAny = entity as Record<string, unknown>;
        const currentFiles = (entityAny[fieldName] ?? []) as FileItem[];

        const toAddMap = new Map(diff.toAdd.map((file) => [file.fileId, file]));
        const toUpdateMap = new Map(
          diff.toUpdate.map((file) => [file.fileId, file]),
        );

        const updatedFiles = currentFiles.map((file) => {
          const enrichedFile =
            toAddMap.get(file.fileId) || toUpdateMap.get(file.fileId);

          return enrichedFile || file;
        });

        updatedEntityAny[fieldName] = updatedFiles;
      }

      return updatedEntity;
    });
  }

  private getFilesFields(objectMetadataId: string): FlatFieldMetadata[] {
    const objectMetadata =
      this.internalContext.flatObjectMetadataMaps.byId[objectMetadataId];

    if (!objectMetadata) {
      return [];
    }

    const objectFields = getFlatFieldsFromFlatObjectMetadata(
      objectMetadata,
      this.internalContext.flatFieldMetadataMaps,
    );

    return objectFields.filter(
      (field) => field.type === FieldMetadataType.FILES,
    );
  }
}
