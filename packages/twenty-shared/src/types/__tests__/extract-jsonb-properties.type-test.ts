import { type ExtractJsonbProperties } from '@/types/ExtractJsonbProperties.type';
import { type JsonbProperty } from '@/types/JsonbProperty.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

type TestedRecord = {
  no1: {};
  no2: {} | null;
  yes1: JsonbProperty<{}>;
  yes2: JsonbProperty<{}>;
  yes3: JsonbProperty<{}> | null;
  yes4: JsonbProperty<{}> | undefined;
  yes5?: JsonbProperty<{}>;
  yes6: JsonbProperty<{} | null>;
  yes7: JsonbProperty<{} | undefined>;
};
type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // TestResult should only include JsonbProperty fields, not plain objects like no1/no2
  Expect<
    Equal<
      TestResult,
      'yes1' | 'yes2' | 'yes3' | 'yes4' | 'yes5' | 'yes6' | 'yes7'
    >
  >,
];
