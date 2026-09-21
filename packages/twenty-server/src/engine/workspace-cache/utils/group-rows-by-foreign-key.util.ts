import { type ObjectLiteral } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

export const groupRowsByForeignKey = ({
  rows,
  foreignKey,
}: {
  rows: ObjectLiteral[];
  foreignKey: string;
}): Map<string, ObjectLiteral[]> => {
  const rowsByForeignKeyValue = new Map<string, ObjectLiteral[]>();

  for (const row of rows) {
    const foreignKeyValue = row[foreignKey];

    if (!isDefined(foreignKeyValue)) {
      continue;
    }

    const existingRows = rowsByForeignKeyValue.get(foreignKeyValue);

    if (isDefined(existingRows)) {
      existingRows.push(row);
    } else {
      rowsByForeignKeyValue.set(foreignKeyValue, [row]);
    }
  }

  return rowsByForeignKeyValue;
};
