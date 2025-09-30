import { createHash } from 'crypto';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

type GenerateDeterministicIndexNameArgs = {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular' | 'isCustom'>;
  isUnique?: boolean;
  relatedFieldNames: Pick<FlatFieldMetadata, 'name'>[];
};
export const generateDeterministicIndexNameV2 = ({
  relatedFieldNames,
  flatObjectMetadata,
  isUnique = false,
}: GenerateDeterministicIndexNameArgs): string => {
  const hash = createHash('sha256');

  const tableName = computeTableName(
    flatObjectMetadata.nameSingular,
    flatObjectMetadata.isCustom,
  );

  const columnsNames = relatedFieldNames.map(
    (flatFieldMetadata) => flatFieldMetadata.name,
  );

  [tableName, ...columnsNames].forEach((column) => {
    hash.update(column);
  });

  return `IDX_${isUnique ? 'UNIQUE_' : ''}${hash.digest('hex').slice(0, 27)}`;
};
