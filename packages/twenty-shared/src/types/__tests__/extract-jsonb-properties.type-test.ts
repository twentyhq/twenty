import { ExtractJsonbProperties } from '@/types/ExtractJsonbProperties.type';
import { JsonbProperty } from '@/types/JsonbProperty.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

type TestedRecord = {
  no1: {};
  no2: {} | null;
  yes1: JsonbProperty<{}>;
  yes2: JsonbProperty<{}>;
  yes3: JsonbProperty<{}> | null;
  yes4: JsonbProperty<{}> | undefined;
  yes5?: JsonbProperty<{}>;
};
type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // TestResult should only include JsonbProperty fields, not plain objects like no1/no2
  Expect<Equal<TestResult, 'yes1' | 'yes2' | 'yes3' | 'yes4' | 'yes5'>>,
  // @ts-expect-error should fail pass null
  JsonbProperty<{} | null>,
  // @ts-expect-error should fail pass undefined
  JsonbProperty<{} | undefined>,
];
