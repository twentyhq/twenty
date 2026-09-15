import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';

type ProposedUniqueIndex = {
  isUnique: boolean;
  fields: Array<{ fieldMetadataId: string; subFieldName: string | null }>;
};

// Field-level uniqueness is now expressed exclusively as a single-field
// UNIQUE IndexMetadata. Two unique indexes on the same single (field,
// subFieldName) pair are redundant and waste write throughput, so reject.
export const validateNoDuplicateUniqueIndexOrThrow = ({
  proposed,
  existingFlatIndexMaps,
  objectMetadataId,
  ignoreIndexId,
}: {
  proposed: ProposedUniqueIndex;
  existingFlatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  objectMetadataId: string;
  ignoreIndexId?: string;
}): void => {
  if (!proposed.isUnique || proposed.fields.length !== 1) {
    return;
  }

  const [proposedField] = proposed.fields;

  const duplicate = Object.values(
    existingFlatIndexMaps.byUniversalIdentifier,
  ).find((flatIndex) => {
    if (!isDefined(flatIndex)) return false;
    if (flatIndex.id === ignoreIndexId) return false;
    if (!flatIndex.isUnique) return false;
    if (flatIndex.objectMetadataId !== objectMetadataId) return false;
    if (flatIndex.flatIndexFieldMetadatas.length !== 1) return false;

    const existingField = flatIndex.flatIndexFieldMetadatas[0];

    return (
      existingField.fieldMetadataId === proposedField.fieldMetadataId &&
      (existingField.subFieldName ?? null) ===
        (proposedField.subFieldName ?? null)
    );
  });

  if (isDefined(duplicate)) {
    throw new IndexMetadataException(
      `A UNIQUE index already covers this column (${duplicate.name})`,
      IndexMetadataExceptionCode.DUPLICATE_UNIQUE_INDEX,
      {
        userFriendlyMessage: msg`This column is already marked as unique. Toggle the field's "Unique" off first if you want to manage the constraint here.`,
      },
    );
  }
};
