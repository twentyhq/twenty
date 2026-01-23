import { type Expect, type Equal } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractEntityJsonbProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-jsonb-properties.type';

type FieldMetadataJsonbProperties =
  ExtractEntityJsonbProperties<FieldMetadataEntity>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // FieldMetadataEntity JsonbProperty columns:
  // - defaultValue
  // - standardOverrides
  // - options
  // - settings
  Expect<
    Equal<
      FieldMetadataJsonbProperties,
      'defaultValue' | 'standardOverrides' | 'options' | 'settings'
    >
  >,
];
