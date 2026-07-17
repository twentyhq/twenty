import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

type ContentHashableRow = {
  id: string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
};

const serializeRowDate = (value: Date | string | null | undefined): string => {
  if (!isDefined(value)) {
    return '';
  }

  return typeof value === 'string' ? value : value.toISOString();
};

export const computeRowsContentHash = (
  rowSections: Record<string, ContentHashableRow[]>,
): string => {
  const parts: string[] = [];

  for (const sectionName of Object.keys(rowSections).sort()) {
    for (const row of rowSections[sectionName]) {
      parts.push(
        `${sectionName}:${row.id}:${serializeRowDate(row.updatedAt)}:${serializeRowDate(row.deletedAt)}`,
      );
    }
  }

  parts.sort();

  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
};
