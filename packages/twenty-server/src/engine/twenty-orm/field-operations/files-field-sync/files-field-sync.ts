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
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
    return this.computeFilesFieldDiffBeforeUpdate(
      entities,
      target,
      existingRecords,
    );
  }

  computeFilesFieldDiffBeforeUpdate<Entity extends ObjectLiteral>(
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
        const existingFilesValue = (existingRecord?.[filesField.name] ??
          []) as FileItem[];

        const diff = this.validateAndComputeFilesFieldDiff(
          entity as Record<string, unknown>,
          filesField,
          existingFilesValue,
        );

        if (diff) {
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

  computeFilesFieldDiffBeforeUpdateOne<Entity extends ObjectLiteral>(
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

    if (existingRecords.length !== 1) {
      throw new TwentyORMException(
        `Cannot update multiple records with files field at once`,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`You can only update one record with files field at once.`,
        },
      );
    }

    const filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex = {};
    const existingRecord = existingRecords[0];

    for (const filesField of filesFields) {
      const existingFilesValue = (existingRecord?.[filesField.name] ??
        []) as FileItem[];

      const diff = this.validateAndComputeFilesFieldDiff(
        updatePayload as Record<string, unknown>,
        filesField,
        existingFilesValue,
      );

      if (diff) {
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

  computeFilesFieldDiffBeforeInsert<Entity extends ObjectLiteral>(
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
        const diff = this.validateAndComputeFilesFieldDiff(
          entity as Record<string, unknown>,
          filesField,
          [],
        );

        if (diff) {
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

  computeFilesFieldDiffBeforeUpsert<Entity extends ObjectLiteral>(
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
        const existingFilesValue = existingRecord
          ? ((existingRecord[filesField.name] ?? []) as FileItem[])
          : [];

        const diff = this.validateAndComputeFilesFieldDiff(
          entity as Record<string, unknown>,
          filesField,
          existingFilesValue,
        );

        if (diff) {
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

  private validateFilesFieldMaxValues(
    filesField: FlatFieldMetadata,
    newFilesValue: FileItem[],
  ): void {
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
  }

  private validateFileFieldUniversalIdentifier(
    fileId: string,
    fileEntity: FileEntity,
    fileIdToFieldUniversalIdentifier: Map<string, string>,
  ): void {
    const expectedUniversalIdentifier =
      fileIdToFieldUniversalIdentifier.get(fileId);

    if (
      isDefined(expectedUniversalIdentifier) &&
      !fileEntity.path.includes(expectedUniversalIdentifier)
    ) {
      throw new TwentyORMException(
        `File ${fileId} was not uploaded for this field`,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`File ${fileId} was not uploaded for this field. Please re-upload the file.`,
        },
      );
    }
  }

  private validateAndComputeFilesFieldDiff(
    entity: Record<string, unknown>,
    filesField: FlatFieldMetadata,
    existingFilesValue: FileItem[],
  ): FilesFieldDiff | null {
    const newFilesValue = entity[filesField.name] as
      | FileItem[]
      | null
      | undefined;

    if (!isDefined(newFilesValue)) {
      return null;
    }

    this.validateFilesFieldMaxValues(filesField, newFilesValue);

    const diff = this.computeFilesFieldDiff(existingFilesValue, newFilesValue);

    if (
      diff.toAdd.length > 0 ||
      diff.toUpdate.length > 0 ||
      diff.toRemove.length > 0
    ) {
      return diff;
    }

    return null;
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
        toUpdate.push({
          ...existingFile,
          label: newFile.label,
        });
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
    target,
  }: {
    entities: QueryDeepPartialEntity<Entity>[];
    filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex;
    workspaceId: string;
    target: EntityTarget<Entity>;
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

    const objectMetadata = getObjectMetadataFromEntityTarget(
      target,
      this.internalContext,
    );

    const { toAdd, toUpdate, toRemove } = await this.validateAndEnrichFileDiffs(
      filesFieldDiffByEntityIndex,
      workspaceId,
      objectMetadata.id,
    );

    const updatedEntities = this.updateEntitiesWithEnrichedFilesFieldValues(
      entities,
      filesFieldDiffByEntityIndex,
    );

    return {
      entities: updatedEntities,
      fileIds: { toAdd, toUpdate, toRemove },
    };
  }

  private async validateAndEnrichFileDiffs(
    filesFieldDiffByEntityIndex: FilesFieldDiffByEntityIndex,
    workspaceId: string,
    objectMetadataId: string,
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

    const filesFields = this.getFilesFields(objectMetadataId);
    const fieldNameToUniversalIdentifier = new Map(
      filesFields.map((field) => [field.name, field.universalIdentifier]),
    );

    const fileIdToFieldUniversalIdentifier = new Map<string, string>();

    for (const entityDiffs of Object.values(filesFieldDiffByEntityIndex)) {
      for (const [fieldName, diff] of Object.entries(entityDiffs)) {
        const fieldUniversalIdentifier =
          fieldNameToUniversalIdentifier.get(fieldName);

        diff.toAdd.forEach((file) => {
          allFileIds.toAdd.add(file.fileId);
          allFileIdsToFetch.add(file.fileId);
          if (isDefined(fieldUniversalIdentifier)) {
            fileIdToFieldUniversalIdentifier.set(
              file.fileId,
              fieldUniversalIdentifier,
            );
          }
        });
        diff.toUpdate.forEach((file) => {
          allFileIds.toUpdate.add(file.fileId);
          allFileIdsToFetch.add(file.fileId);
          if (isDefined(fieldUniversalIdentifier)) {
            fileIdToFieldUniversalIdentifier.set(
              file.fileId,
              fieldUniversalIdentifier,
            );
          }
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
      select: ['id', 'path', 'settings'],
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

          this.validateFileFieldUniversalIdentifier(
            file.fileId,
            fileEntity,
            fileIdToFieldUniversalIdentifier,
          );

          if (!fileEntity.settings?.isTemporaryFile) {
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

          this.validateFileFieldUniversalIdentifier(
            file.fileId,
            fileEntity,
            fileIdToFieldUniversalIdentifier,
          );

          if (fileEntity.settings?.isTemporaryFile) {
            throw new TwentyORMException(
              `File ${file.fileId} to update should not be a temporary file`,
              TwentyORMExceptionCode.INVALID_INPUT,
              {
                userFriendlyMessage: STANDARD_ERROR_MESSAGE,
              },
            );
          }
        }
      }
    }

    return allFileIds;
  }

  async updateFileEntityRecords(fileIds: {
    toAdd: Set<string>;
    toUpdate: Set<string>;
    toRemove: Set<string>;
  }): Promise<void> {
    if (fileIds.toAdd.size > 0) {
      await this.fileRepository.update(
        { id: In([...fileIds.toAdd]) },
        {
          settings: {
            isTemporaryFile: false,
            toDelete: false,
          },
        },
      );
    }

    if (fileIds.toRemove.size > 0) {
      await this.fileRepository.softDelete([...fileIds.toRemove]);
    }
  }

  private updateEntitiesWithEnrichedFilesFieldValues<
    Entity extends ObjectLiteral,
  >(
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
    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.internalContext.flatObjectMetadataMaps,
    });

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
