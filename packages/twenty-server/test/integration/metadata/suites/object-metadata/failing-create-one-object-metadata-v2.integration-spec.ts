import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { eachTestingContextFilter } from 'twenty-shared/testing';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

describe('Object metadata creation should fail v2', () => {
  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneObjectMetadata({
        input: getMockCreateObjectInput(context),
        expectToFail: true,
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors[0]),
      );
    },
  );
});
