import { createHash } from 'crypto';

import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

type GenerateDeterministicIndexNameArgs = {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  isUnique?: boolean;
  orderedIndexColumnNames: string[];
  // Include the WHERE clause in the hash so a partial index on the same
  // columns doesn't collide with the non-partial one (Postgres lets them
  // coexist; the unique-name constraint must not block that).
  indexWhereClause?: string | null;
};
export const generateDeterministicIndexName = ({
  orderedIndexColumnNames,
  flatObjectMetadata,
  isUnique = false,
  indexWhereClause,
}: GenerateDeterministicIndexNameArgs): string => {
  const hash = createHash('sha256');

  const tableName = computeTableName(
    flatObjectMetadata.nameSingular,
    !belongsToTwentyStandardApp(flatObjectMetadata),
  );

  [tableName, ...orderedIndexColumnNames].forEach((column) => {
    hash.update(column);
  });

  if (indexWhereClause) {
    hash.update(indexWhereClause);
  }

  return `IDX_${isUnique ? 'UNIQUE_' : ''}${hash.digest('hex').slice(0, 27)}`;
};
