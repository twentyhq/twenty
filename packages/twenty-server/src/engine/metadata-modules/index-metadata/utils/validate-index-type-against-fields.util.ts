import { msg } from '@lingui/core/macro';
import { GIN_COMPATIBLE_FIELD_TYPES } from 'twenty-shared/constants';
import { type FieldMetadataType } from 'twenty-shared/types';

import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

type IndexFieldForValidation = {
  type: FieldMetadataType;
  name: string;
  label: string;
  subFieldName: string | null;
};

// GIN requires an operator class for each column. Postgres ships a default
// opclass only for jsonb (RAW_JSON), text[]/varchar[] (ARRAY, MULTI_SELECT),
// and tsvector (TS_VECTOR). Composite parents resolve to scalar text/numeric
// sub-columns, none of which have a default GIN opclass.
export const validateIndexTypeAgainstFieldsOrThrow = ({
  indexType,
  fields,
}: {
  indexType: IndexType;
  fields: IndexFieldForValidation[];
}): void => {
  if (indexType !== IndexType.GIN) {
    return;
  }

  for (const field of fields) {
    if (field.subFieldName !== null) {
      throw new IndexMetadataException(
        `GIN index does not support composite sub-property ${field.name}.${field.subFieldName}`,
        IndexMetadataExceptionCode.INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE,
        {
          userFriendlyMessage: msg`GIN indexes work on multi-select, array, JSON, and search-vector columns. "${field.label}" sub-properties don't qualify.`,
        },
      );
    }

    if (!GIN_COMPATIBLE_FIELD_TYPES.has(field.type)) {
      throw new IndexMetadataException(
        `GIN index does not support field ${field.name} of type ${field.type}`,
        IndexMetadataExceptionCode.INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE,
        {
          userFriendlyMessage: msg`GIN indexes work on multi-select, array, JSON, and search-vector columns. "${field.label}" doesn't qualify.`,
        },
      );
    }
  }
};
