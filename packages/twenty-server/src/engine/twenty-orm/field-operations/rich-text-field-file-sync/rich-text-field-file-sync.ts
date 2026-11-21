import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, type Repository } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type RichTextFieldRecordTable } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-record-table.type';
import { type RichTextFieldWrittenDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-written-document.type';
import { computeRichTextFieldFileChanges } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-file-changes.util';
import { computeRichTextFieldWrittenDocuments } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-written-documents.util';
import { computeRichTextFileIdsColumnName } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-file-ids-column-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type OwnedFileIdsByFieldName = Record<string, string[]>;

// The record lists every file its rich text fields claimed, released ones included, so only that record can bring one back.
export class RichTextFieldFileSync {
  private readonly internalContext: WorkspaceInternalContext;
  private readonly fileRepository: Repository<FileEntity>;

  constructor(internalContext: WorkspaceInternalContext) {
    this.internalContext = internalContext;
    this.fileRepository =
      internalContext.coreDataSource.getRepository(FileEntity);
  }

  hasRichTextFields(objectMetadataId: string): boolean {
    return this.getRichTextFields(objectMetadataId).length > 0;
  }

  computeWrittenDocuments({
    payload,
    objectMetadataId,
  }: {
    payload: Record<string, unknown>;
    objectMetadataId: string;
  }): RichTextFieldWrittenDocument[] {
    return computeRichTextFieldWrittenDocuments({
      payload,
      richTextFields: this.getRichTextFields(objectMetadataId),
    });
  }

  async assertReferencedUploadsAreCompleteOrThrow({
    writtenDocuments,
    workspaceId,
  }: {
    writtenDocuments: RichTextFieldWrittenDocument[];
    workspaceId: string;
  }): Promise<void> {
    const referencedFileIds = writtenDocuments.flatMap(
      ({ referencedFileIds }) => referencedFileIds,
    );

    if (referencedFileIds.length === 0) {
      return;
    }

    const pendingFiles = await this.fileRepository.find({
      where: {
        id: In(referencedFileIds),
        workspaceId,
        status: FILE_STATUS.PENDING,
      },
      select: ['id', 'settings'],
    });
    const pendingUpload = pendingFiles.find(
      ({ settings }) =>
        settings?.isTemporaryFile === true &&
        settings.isClaimableByRecord === true,
    );

    if (!isDefined(pendingUpload)) {
      return;
    }

    const fileId = pendingUpload.id;

    throw new TwentyOrmException(
      `File ${fileId} upload has not been completed`,
      TwentyOrmExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`File ${fileId} upload has not been completed. Please retry the upload.`,
      },
    );
  }

  async syncOwnedFiles({
    recordWrites,
    recordTable,
    workspaceId,
    isInsert,
  }: {
    recordWrites: {
      recordId: string;
      writtenDocuments: RichTextFieldWrittenDocument[];
    }[];
    recordTable: RichTextFieldRecordTable;
    workspaceId: string;
    isInsert: boolean;
  }): Promise<void> {
    const documentWrites = recordWrites.filter(
      ({ writtenDocuments }) => writtenDocuments.length > 0,
    );

    if (documentWrites.length === 0) {
      return;
    }

    const ownedFileIdsByRecordId = isInsert
      ? new Map<string, OwnedFileIdsByFieldName>()
      : await this.findOwnedFileIdsByFieldNameByRecordId({
          recordIds: documentWrites.map(({ recordId }) => recordId),
          fieldNames: [
            ...new Set(
              documentWrites.flatMap(({ writtenDocuments }) =>
                writtenDocuments.map(({ fieldName }) => fieldName),
              ),
            ),
          ],
          recordTable,
        });

    const fileIdsToRestore: string[] = [];
    const fileIdsToRelease: string[] = [];

    for (const { recordId, writtenDocuments } of documentWrites) {
      for (const writtenDocument of writtenDocuments) {
        const fileChanges = computeRichTextFieldFileChanges({
          ownedFileIds:
            ownedFileIdsByRecordId.get(recordId)?.[writtenDocument.fieldName] ??
            [],
          referencedFileIds: writtenDocument.referencedFileIds,
        });

        fileIdsToRestore.push(...fileChanges.fileIdsToRestore);
        fileIdsToRelease.push(...fileChanges.fileIdsToRelease);

        await this.claimUploadedFiles({
          fileIds: fileChanges.fileIdsToClaim,
          recordId,
          writtenDocument,
          recordTable,
          workspaceId,
        });
      }
    }

    if (fileIdsToRestore.length > 0) {
      await this.fileRepository.restore({
        id: In(fileIdsToRestore),
        workspaceId,
        deletedAt: Not(IsNull()),
      });
    }

    await this.releaseFiles({ fileIds: fileIdsToRelease, workspaceId });
  }

  async findOwnedFileIdsByRecordId({
    recordIds,
    objectMetadataId,
    recordTable,
  }: {
    recordIds: string[];
    objectMetadataId: string;
    recordTable: RichTextFieldRecordTable;
  }): Promise<Map<string, string[]>> {
    const fieldNames = this.getRichTextFields(objectMetadataId).map(
      ({ name }) => name,
    );

    if (recordIds.length === 0 || fieldNames.length === 0) {
      return new Map();
    }

    const ownedFileIdsByFieldNameByRecordId =
      await this.findOwnedFileIdsByFieldNameByRecordId({
        recordIds,
        fieldNames,
        recordTable,
      });

    return new Map(
      [...ownedFileIdsByFieldNameByRecordId].map(
        ([recordId, ownedFileIdsByFieldName]) => [
          recordId,
          Object.values(ownedFileIdsByFieldName).flat(),
        ],
      ),
    );
  }

  async releaseFiles({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    await this.fileRepository.softDelete({
      id: In(fileIds),
      workspaceId,
      deletedAt: IsNull(),
    });
  }

  private async claimUploadedFiles({
    fileIds,
    recordId,
    writtenDocument,
    recordTable,
    workspaceId,
  }: {
    fileIds: string[];
    recordId: string;
    writtenDocument: RichTextFieldWrittenDocument;
    recordTable: RichTextFieldRecordTable;
    workspaceId: string;
  }): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    // Only an upload made for this field and not yet claimed matches, so a file of another record stays a plain reference.
    const claimResult = await this.fileRepository
      .createQueryBuilder()
      .update(FileEntity)
      .set({ settings: { isTemporaryFile: false, toDelete: false } })
      .where({
        id: In(fileIds),
        workspaceId,
        status: Not(FILE_STATUS.PENDING),
      })
      .andWhere(`settings->>'isTemporaryFile' = 'true'`)
      .andWhere(`settings->>'isClaimableByRecord' = 'true'`)
      .andWhere(`strpos("path", :fieldUniversalIdentifier) > 0`, {
        fieldUniversalIdentifier: writtenDocument.fieldUniversalIdentifier,
      })
      .returning(['id'])
      .execute();

    const claimedFileIds = (claimResult.raw as Pick<FileEntity, 'id'>[]).map(
      ({ id }) => id,
    );

    if (claimedFileIds.length === 0) {
      return;
    }

    const fileIdsColumn = escapeIdentifier(
      computeRichTextFileIdsColumnName(writtenDocument.fieldName),
    );

    await recordTable.executeRawQuery(
      `UPDATE ${recordTable.tableExpression}
       SET ${fileIdsColumn} = COALESCE(${fileIdsColumn}, '[]'::jsonb) || $2::jsonb
       WHERE "id" = $1`,
      [recordId, JSON.stringify(claimedFileIds)],
    );
  }

  private async findOwnedFileIdsByFieldNameByRecordId({
    recordIds,
    fieldNames,
    recordTable,
  }: {
    recordIds: string[];
    fieldNames: string[];
    recordTable: RichTextFieldRecordTable;
  }): Promise<Map<string, OwnedFileIdsByFieldName>> {
    const fileIdsColumnNameByFieldName = new Map(
      fieldNames.map((fieldName) => [
        fieldName,
        computeRichTextFileIdsColumnName(fieldName),
      ]),
    );
    const fileIdsColumns = [...fileIdsColumnNameByFieldName.values()].map(
      (columnName) => escapeIdentifier(columnName),
    );

    const rows = await recordTable.executeRawQuery(
      `SELECT "id", ${fileIdsColumns.join(', ')}
       FROM ${recordTable.tableExpression}
       WHERE "id" = ANY($1::uuid[])
         AND (${fileIdsColumns.map((column) => `${column} IS NOT NULL`).join(' OR ')})`,
      [recordIds],
    );

    return new Map(
      rows.map((row) => [
        String(row.id),
        Object.fromEntries(
          [...fileIdsColumnNameByFieldName].map(([fieldName, columnName]) => [
            fieldName,
            Array.isArray(row[columnName])
              ? row[columnName].filter(isString)
              : [],
          ]),
        ),
      ]),
    );
  }

  private getRichTextFields(objectMetadataId: string): OrmFlatFieldMetadata[] {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.internalContext.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return [];
    }

    return getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      this.internalContext.flatFieldMetadataMaps,
    ).filter((field) => field.type === FieldMetadataType.RICH_TEXT);
  }
}
