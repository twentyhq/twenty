import { ExtractJsonbProperties } from '@/types/ExtractJsonbProperties.type';
import { JsonbProperty } from '@/types/JsonbProperty.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

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
type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // TestResult should only include JsonbProperty fields, not plain objects like no1/no2
  Expect<
    Equal<TestResult, 'yes2' | 'yes3' | 'yes4' | 'yes5' | 'yes6' | 'yes7'>
  >,
];
