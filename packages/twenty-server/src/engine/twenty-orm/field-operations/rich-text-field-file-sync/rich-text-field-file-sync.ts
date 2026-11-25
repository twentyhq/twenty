import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type RawQueryExecutor } from 'src/engine/twenty-orm/field-operations/file-lifecycle/types/raw-query-executor.type';
import { claimTemporaryFiles } from 'src/engine/twenty-orm/field-operations/file-lifecycle/utils/claim-temporary-files.util';
import { type RichTextFieldRecordTable } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-record-table.type';
import { type RichTextFieldWrittenDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-written-document.type';
import { computeRichTextDocumentColumnNames } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-document-column-names.util';
import { computeRichTextFieldWrittenDocuments } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-written-documents.util';
import { computeRichTextFileIdsColumnName } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-file-ids-column-name.util';
import { isRewritingRichTextDocument } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/is-rewriting-rich-text-document.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordFile = { recordId: string; fileId: string };

const computeFieldFilePathPrefix = (fieldUniversalIdentifier: string) =>
  `${FileFolder.FilesField}/${fieldUniversalIdentifier}/`;

type RichTextFieldFileSyncContext = Pick<
  WorkspaceInternalContext,
  'workspaceId' | 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>;

// The record lists every file its rich text fields claimed, released ones included, so only that record can bring one back while it exists.
export class RichTextFieldFileSync {
  private readonly internalContext: RichTextFieldFileSyncContext;

  constructor(internalContext: RichTextFieldFileSyncContext) {
    this.internalContext = internalContext;
  }

  hasRichTextFields(objectMetadataId: string): boolean {
    return this.getRichTextFields(objectMetadataId).length > 0;
  }

  isRewritingDocument({
    payload,
    objectMetadataId,
  }: {
    payload: Record<string, unknown>;
    objectMetadataId: string;
  }): boolean {
    return this.getRichTextFields(objectMetadataId).some(({ name }) =>
      isRewritingRichTextDocument(payload[name]),
    );
  }

  computeWrittenDocuments({
    payload,
    recordBeforeWrite,
    objectMetadataId,
  }: {
    payload: Record<string, unknown>;
    recordBeforeWrite: Record<string, unknown> | undefined;
    objectMetadataId: string;
  }): RichTextFieldWrittenDocument[] {
    return computeRichTextFieldWrittenDocuments({
      payload,
      recordBeforeWrite,
      richTextFields: this.getRichTextFields(objectMetadataId),
    });
  }

  async assertAddedUploadsAreCompleteOrThrow({
    writtenDocuments,
    executeRawQuery,
  }: {
    writtenDocuments: RichTextFieldWrittenDocument[];
    executeRawQuery: RawQueryExecutor;
  }): Promise<void> {
    const addedFileIds = writtenDocuments.flatMap(
      ({ addedFileIds }) => addedFileIds,
    );

    if (addedFileIds.length === 0) {
      return;
    }

    const [pendingUpload] = await executeRawQuery(
      `SELECT "id" FROM "core"."file"
       WHERE "id" = ANY($1::uuid[])
         AND "workspaceId" = $2
         AND "status" = 'PENDING'
         AND "settings"->>'isTemporaryFile' = 'true'
         AND "settings"->>'isClaimableByRecord' = 'true'
       LIMIT 1`,
      [addedFileIds, this.internalContext.workspaceId],
    );

    if (!isDefined(pendingUpload)) {
      return;
    }

    const fileId = String(pendingUpload.id);

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
    isInsert,
  }: {
    recordWrites: {
      recordId: string;
      writtenDocuments: RichTextFieldWrittenDocument[];
    }[];
    recordTable: RichTextFieldRecordTable;
    isInsert: boolean;
  }): Promise<void> {
    const documentWrites = recordWrites.flatMap(
      ({ recordId, writtenDocuments }) =>
        writtenDocuments.map((writtenDocument) => ({
          recordId,
          ...writtenDocument,
        })),
    );

    await this.takeOwnershipOfFiles({ documentWrites, recordTable });

    if (isInsert) {
      return;
    }

    const fieldNames = [
      ...new Set(documentWrites.map(({ fieldName }) => fieldName)),
    ];

    for (const fieldName of fieldNames) {
      const fieldDocumentWrites = documentWrites.filter(
        (documentWrite) => documentWrite.fieldName === fieldName,
      );

      // Every referenced file, not only the added ones: this save may have read the record before another one released a file.
      await this.setOwnedFilesDeletedWhenStoredDocumentAgrees({
        recordFiles: fieldDocumentWrites.flatMap(
          ({ recordId, referencedFileIds }) =>
            referencedFileIds.map((fileId) => ({ recordId, fileId })),
        ),
        fieldName,
        recordTable,
        isDeleted: false,
      });
      await this.setOwnedFilesDeletedWhenStoredDocumentAgrees({
        recordFiles: fieldDocumentWrites.flatMap(
          ({ recordId, removedFileIds }) =>
            removedFileIds.map((fileId) => ({ recordId, fileId })),
        ),
        fieldName,
        recordTable,
        isDeleted: true,
      });
    }
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
    const fileIdsColumnNames = this.getRichTextFields(objectMetadataId).map(
      ({ name }) => computeRichTextFileIdsColumnName(name),
    );

    if (recordIds.length === 0 || fileIdsColumnNames.length === 0) {
      return new Map();
    }

    const fileIdsColumns = fileIdsColumnNames.map((columnName) =>
      escapeIdentifier(columnName),
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
        fileIdsColumnNames.flatMap((columnName) =>
          Array.isArray(row[columnName])
            ? row[columnName].filter(isString)
            : [],
        ),
      ]),
    );
  }

  // The flag lets another record whose body references the file adopt it, as the record a merge keeps does.
  async releaseFilesOfDestroyedRecords({
    fileIds,
    executeRawQuery,
  }: {
    fileIds: string[];
    executeRawQuery: RawQueryExecutor;
  }): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    await executeRawQuery(
      `UPDATE "core"."file"
       SET "deletedAt" = COALESCE("deletedAt", now()),
           "settings" = "settings" || '{"isOwnedByDestroyedRecord":true}'::jsonb
       WHERE "id" = ANY($1::uuid[])
         AND "workspaceId" = $2`,
      [fileIds, this.internalContext.workspaceId],
    );
  }

  private async takeOwnershipOfFiles({
    documentWrites,
    recordTable,
  }: {
    documentWrites: (RichTextFieldWrittenDocument & { recordId: string })[];
    recordTable: RichTextFieldRecordTable;
  }): Promise<void> {
    const claimedFileIds = new Set(
      await claimTemporaryFiles({
        executeRawQuery: recordTable.executeRawQuery,
        workspaceId: this.internalContext.workspaceId,
        claims: documentWrites.flatMap(
          ({ fieldUniversalIdentifier, addedFileIds }) =>
            addedFileIds.map((fileId) => ({
              fileId,
              pathPrefix: computeFieldFilePathPrefix(fieldUniversalIdentifier),
            })),
        ),
        isClaimableByRecordRequired: true,
      }),
    );

    const fieldNames = [
      ...new Set(documentWrites.map(({ fieldName }) => fieldName)),
    ];

    for (const fieldName of fieldNames) {
      const fieldDocumentWrites = documentWrites.filter(
        (documentWrite) => documentWrite.fieldName === fieldName,
      );
      const adoptedFileIds = new Set(
        await this.adoptFilesOfDestroyedRecords({
          fileIds: [
            ...new Set(
              fieldDocumentWrites.flatMap(({ referencedFileIds }) =>
                referencedFileIds.filter(
                  (fileId) => !claimedFileIds.has(fileId),
                ),
              ),
            ),
          ],
          fieldUniversalIdentifier:
            fieldDocumentWrites[0].fieldUniversalIdentifier,
          recordTable,
        }),
      );

      const ownedFileIdsByRecordId = new Map<string, string[]>();

      for (const { recordId, referencedFileIds } of fieldDocumentWrites) {
        for (const fileId of referencedFileIds) {
          const isNewlyOwned =
            claimedFileIds.delete(fileId) || adoptedFileIds.delete(fileId);

          if (!isNewlyOwned) {
            continue;
          }

          ownedFileIdsByRecordId.set(recordId, [
            ...(ownedFileIdsByRecordId.get(recordId) ?? []),
            fileId,
          ]);
        }
      }

      if (ownedFileIdsByRecordId.size === 0) {
        continue;
      }

      const fileIdsColumn = escapeIdentifier(
        computeRichTextFileIdsColumnName(fieldName),
      );

      await recordTable.executeRawQuery(
        `UPDATE ${recordTable.tableExpression} AS "record"
         SET ${fileIdsColumn} = COALESCE("record".${fileIdsColumn}, '[]'::jsonb) || "owned"."fileIds"::jsonb
         FROM unnest($1::uuid[], $2::text[]) AS "owned"("recordId", "fileIds")
         WHERE "record"."id" = "owned"."recordId"`,
        [
          [...ownedFileIdsByRecordId.keys()],
          [...ownedFileIdsByRecordId.values()].map((fileIds) =>
            JSON.stringify(fileIds),
          ),
        ],
      );
    }
  }

  private async adoptFilesOfDestroyedRecords({
    fileIds,
    fieldUniversalIdentifier,
    recordTable,
  }: {
    fileIds: string[];
    fieldUniversalIdentifier: string;
    recordTable: RichTextFieldRecordTable;
  }): Promise<string[]> {
    if (fileIds.length === 0) {
      return [];
    }

    const adoptedFiles = await recordTable.executeRawQuery(
      `UPDATE "core"."file" AS "file"
       SET "deletedAt" = NULL,
           "settings" = "file"."settings" - 'isOwnedByDestroyedRecord',
           "updatedAt" = now()
       WHERE "file"."id" = ANY($1::uuid[])
         AND "file"."workspaceId" = $2
         AND "file"."settings"->>'isOwnedByDestroyedRecord' = 'true'
         AND starts_with("file"."path", $3)
       RETURNING "file"."id"`,
      [
        fileIds,
        this.internalContext.workspaceId,
        computeFieldFilePathPrefix(fieldUniversalIdentifier),
      ],
    );

    return adoptedFiles.map(({ id }) => String(id));
  }

  // The locked stored document decides, so a save that finishes late cannot undo a newer one.
  private async setOwnedFilesDeletedWhenStoredDocumentAgrees({
    recordFiles,
    fieldName,
    recordTable,
    isDeleted,
  }: {
    recordFiles: RecordFile[];
    fieldName: string;
    recordTable: RichTextFieldRecordTable;
    isDeleted: boolean;
  }): Promise<void> {
    if (recordFiles.length === 0) {
      return;
    }

    const fileIdsColumn = escapeIdentifier(
      computeRichTextFileIdsColumnName(fieldName),
    );
    const storedDocument = computeRichTextDocumentColumnNames(fieldName)
      .map((columnName) => `COALESCE(${escapeIdentifier(columnName)}, '')`)
      .join(' || ');

    await recordTable.executeRawQuery(
      `WITH "lockedRecord" AS (
         SELECT "id", ${fileIdsColumn} AS "ownedFileIds", ${storedDocument} AS "storedDocument"
         FROM ${recordTable.tableExpression}
         WHERE "id" = ANY($2::uuid[])
         ORDER BY "id"
         FOR NO KEY UPDATE
       )
       UPDATE "core"."file" AS "file"
       SET "deletedAt" = ${isDeleted ? 'now()' : 'NULL'}
       FROM unnest($1::uuid[], $2::uuid[]) AS "change"("fileId", "recordId")
       JOIN "lockedRecord" ON "lockedRecord"."id" = "change"."recordId"
       WHERE "file"."id" = "change"."fileId"
         AND "file"."workspaceId" = $3
         AND "file"."deletedAt" IS ${isDeleted ? '' : 'NOT '}NULL
         AND "lockedRecord"."ownedFileIds" @> to_jsonb("change"."fileId"::text)
         AND strpos("lockedRecord"."storedDocument", "change"."fileId"::text) ${isDeleted ? '= 0' : '> 0'}`,
      [
        recordFiles.map(({ fileId }) => fileId),
        recordFiles.map(({ recordId }) => recordId),
        this.internalContext.workspaceId,
      ],
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
