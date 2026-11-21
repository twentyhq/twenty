import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeRichTextFieldFileReferenceChange } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-file-reference-change.util';
import { type RichTextFieldFileOwnershipUpdates } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-file-ownership-updates.type';
import { type RichTextFieldFileReferenceChange } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/types/rich-text-field-file-reference-change.type';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

type RecordWrite = {
  payload: Record<string, unknown>;
  recordBeforeWrite: Record<string, unknown> | undefined;
};

// Files of another field or record are left alone, so bodies referencing attachment-owned files keep working.
export class RichTextFieldFileSync {
  private readonly internalContext: WorkspaceInternalContext;
  private readonly fileRepository: Repository<FileEntity>;

  constructor(internalContext: WorkspaceInternalContext) {
    this.internalContext = internalContext;
    this.fileRepository =
      internalContext.coreDataSource.getRepository(FileEntity);
  }

  isWritingRichTextField({
    payload,
    objectMetadataId,
  }: {
    payload: Record<string, unknown>;
    objectMetadataId: string;
  }): boolean {
    return this.getRichTextFields(objectMetadataId).some(
      (richTextField) => payload[richTextField.name] !== undefined,
    );
  }

  computeFileReferenceChanges({
    recordWrites,
    objectMetadataId,
  }: {
    recordWrites: RecordWrite[];
    objectMetadataId: string;
  }): RichTextFieldFileReferenceChange[] {
    const richTextFields = this.getRichTextFields(objectMetadataId);

    if (richTextFields.length === 0) {
      return [];
    }

    return recordWrites.flatMap(({ payload, recordBeforeWrite }, recordIndex) =>
      richTextFields
        .map((richTextField) =>
          computeRichTextFieldFileReferenceChange({
            recordIndex,
            fieldName: richTextField.name,
            fieldUniversalIdentifier: richTextField.universalIdentifier,
            payload,
            recordBeforeWrite,
          }),
        )
        .filter(isDefined),
    );
  }

  async resolveFileOwnershipUpdatesOrThrow({
    fileReferenceChanges,
    workspaceId,
  }: {
    fileReferenceChanges: RichTextFieldFileReferenceChange[];
    workspaceId: string;
  }): Promise<RichTextFieldFileOwnershipUpdates | null> {
    const fileIds = fileReferenceChanges.flatMap(
      ({ addedFileIds, removedFileIds }) => [
        ...addedFileIds,
        ...removedFileIds,
      ],
    );

    if (fileIds.length === 0) {
      return null;
    }

    const files = await this.fileRepository.find({
      where: { id: In(fileIds), workspaceId },
      select: ['id', 'path', 'settings', 'status', 'recordId', 'deletedAt'],
      withDeleted: true,
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    const claimedFileIds = new Set<string>();
    const fileIdsToClaimByRecordIndex = new Map<number, string[]>();
    const fileIdsToRelease = new Set<string>();

    for (const fileReferenceChange of fileReferenceChanges) {
      const { recordIndex, recordId, fieldUniversalIdentifier } =
        fileReferenceChange;
      const isUploadedForField = (file: FileEntity) =>
        file.path.includes(fieldUniversalIdentifier);

      for (const fileId of fileReferenceChange.addedFileIds) {
        const file = fileById.get(fileId);

        const isReleasedFile = isDefined(file?.deletedAt);

        if (
          !isDefined(file) ||
          !isUploadedForField(file) ||
          (!file.settings?.isTemporaryFile && !isReleasedFile) ||
          claimedFileIds.has(fileId)
        ) {
          continue;
        }

        if (file.status === FILE_STATUS.PENDING) {
          throw new TwentyOrmException(
            `File ${fileId} upload has not been completed`,
            TwentyOrmExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`File ${fileId} upload has not been completed. Please retry the upload.`,
            },
          );
        }

        claimedFileIds.add(fileId);
        fileIdsToClaimByRecordIndex.set(recordIndex, [
          ...(fileIdsToClaimByRecordIndex.get(recordIndex) ?? []),
          fileId,
        ]);
      }

      for (const fileId of fileReferenceChange.removedFileIds) {
        const file = fileById.get(fileId);

        if (
          isDefined(file) &&
          !isDefined(file.deletedAt) &&
          isDefined(recordId) &&
          file.recordId === recordId &&
          isUploadedForField(file)
        ) {
          fileIdsToRelease.add(fileId);
        }
      }
    }

    if (claimedFileIds.size === 0 && fileIdsToRelease.size === 0) {
      return null;
    }

    return {
      fileIdsToClaimByRecordIndex,
      fileIdsToRelease: [...fileIdsToRelease],
    };
  }

  async applyFileOwnershipUpdates({
    fileOwnershipUpdates: { fileIdsToClaimByRecordIndex, fileIdsToRelease },
    recordIds,
    workspaceId,
  }: {
    fileOwnershipUpdates: RichTextFieldFileOwnershipUpdates;
    recordIds: (string | undefined)[];
    workspaceId: string;
  }): Promise<void> {
    const claimedFileIds: string[] = [];
    const claimingRecordIds: string[] = [];

    for (const [recordIndex, fileIds] of fileIdsToClaimByRecordIndex) {
      const recordId = recordIds[recordIndex];

      if (!isDefined(recordId)) {
        continue;
      }

      for (const fileId of fileIds) {
        claimedFileIds.push(fileId);
        claimingRecordIds.push(recordId);
      }
    }

    if (claimedFileIds.length > 0) {
      // Only a temporary or released file can be claimed, so one another write claimed first stays with that record.
      await this.fileRepository.query(
        `UPDATE "core"."file" AS "file"
         SET "settings" = '{"isTemporaryFile":false,"toDelete":false}'::jsonb,
             "recordId" = "claim"."recordId",
             "deletedAt" = NULL
         FROM unnest($1::uuid[], $2::uuid[]) AS "claim"("fileId", "recordId")
         WHERE "file"."id" = "claim"."fileId"
           AND "file"."workspaceId" = $3
           AND ("file"."settings"->>'isTemporaryFile' = 'true'
             OR "file"."deletedAt" IS NOT NULL)`,
        [claimedFileIds, claimingRecordIds, workspaceId],
      );
    }

    if (fileIdsToRelease.length > 0) {
      await this.fileRepository.softDelete({
        id: In(fileIdsToRelease),
        workspaceId,
      });
    }
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
