import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

describe('Object metadata creation should fail', () => {
  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const { errors } = await createOneObjectMetadata({
      input: getMockCreateObjectInput(context),
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const firstError = errors[0];

    expect(firstError.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(firstError.message).toMatchSnapshot();
  });
});
