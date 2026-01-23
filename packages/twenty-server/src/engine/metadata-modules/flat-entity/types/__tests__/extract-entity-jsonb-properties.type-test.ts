import { type Equal, type Expect } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractEntityJsonbProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-jsonb-properties.type';
import { JsonbProperty } from 'src/engine/workspace-manager/types/jsonb-property.type';

type TestedRecord = {
  no1: {};
  no2: {} | null;
  yes2: JsonbProperty<{}>;
  yes3: JsonbProperty<{}>;
  yes4: JsonbProperty<{}> | null;
  yes5: JsonbProperty<{} | null>;
  yes6: JsonbProperty<{}> | undefined;
  yes7?: JsonbProperty<{}>;
};
type TestResult = ExtractEntityJsonbProperties<TestedRecord>;
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
  // TestResult should only include JsonbProperty fields, not plain objects like test1
  Expect<
    Equal<TestResult, 'yes2' | 'yes3' | 'yes4' | 'yes5' | 'yes6' | 'yes7'>
  >,
];
