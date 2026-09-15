import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { eachTestingContextFilter } from 'twenty-shared/testing';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

describe('Object metadata creation should fail v2', () => {
  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context: { input, expected } }) => {
      const { errors } = await createOneObjectMetadata({
        input: getMockCreateObjectInput(input),
        expectToFail: true,
      });

      expect(errors.length).toBe(1);

      const [error] = errors;

      expect(error.extensions.code).toBe(expected.errorCode);

      if (expected.errorCode === 'BAD_USER_INPUT') {
        expect(error.message).toContain(expected.messageContains);

        return;
      }

      const objectMetadataFailures = error.extensions.errors.objectMetadata;

      expect(objectMetadataFailures).toHaveLength(1);
      expect(objectMetadataFailures[0].errors).toEqual(
        expect.arrayContaining(
          expected.objectValidationMessages.map((message) =>
            expect.objectContaining({ message }),
          ),
        ),
      );
    },
  );
});
