import { type Expect, type Equal } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';

type FieldMetadataDateProperties =
  CastRecordTypeOrmDatePropertiesToString<FieldMetadataEntity>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // FieldMetadataEntity has createdAt and updatedAt Date properties
  Expect<
    Equal<
      FieldMetadataDateProperties,
      {
        createdAt: string;
        updatedAt: string;
      }
    >
  >,
];
