import { type EntityManager, type ObjectLiteral, In } from 'typeorm';
import { isNonEmptyString } from 'twenty-shared/utils';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export const hydrateAgentHistoryFiles = async ({
  records,
  manager,
  workspaceId,
}: {
  records: ObjectLiteral[];
  manager: EntityManager;
  workspaceId: string;
}): Promise<void> => {
  const parts: ObjectLiteral[] = [];
  const collectParts = (record: ObjectLiteral) => {
    if ('fileId' in record) {
      parts.push(record);
    }
    for (const relation of ['parts', 'messages', 'turns', 'evaluations']) {
      if (Array.isArray(record[relation])) {
        record[relation].forEach(collectParts);
      }
    }
  };
  records.forEach(collectParts);
  const fileIds = [
    ...new Set(parts.map((part) => part.fileId).filter(isNonEmptyString)),
  ];
  const files = fileIds.length
    ? await manager
        .getRepository(FileEntity)
        .find({ where: { id: In(fileIds), workspaceId } })
    : [];
  const filesById = new Map(files.map((file) => [file.id, file]));
  for (const part of parts) part.file = filesById.get(part.fileId) ?? null;
};
