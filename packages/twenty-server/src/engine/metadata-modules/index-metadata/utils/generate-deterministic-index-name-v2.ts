import { createHash } from 'crypto';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

type GenerateDeterministicIndexNameArgs = {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular' | 'isCustom'>;
  flatFieldMetadatas: Pick<FlatFieldMetadata, 'name'>[];
  isUnique: boolean;
};
export const generateDeterministicIndexNameV2 = ({
  flatFieldMetadatas,
  flatObjectMetadata,
  isUnique,
}: GenerateDeterministicIndexNameArgs): string => {
  const hash = createHash('sha256');

  const tableName = computeTableName(
    flatObjectMetadata.nameSingular,
    flatObjectMetadata.isCustom,
  );
  const columnsNames = flatFieldMetadatas.map(
    (flatFieldMetadata) => flatFieldMetadata.name,
  );
  [tableName, ...columnsNames].forEach((column) => {
    hash.update(column);
  });

  return `IDX_${isUnique ? 'UNIQUE_' : ''}${hash.digest('hex').slice(0, 27)}`;
};
