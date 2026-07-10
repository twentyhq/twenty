import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

type FlatEntityValidationReport = {
  flatEntityMinimalInformation?: { name?: string };
};

// The per-entity validation reports are assembled from maps keyed by
// per-run random universal identifiers, so their order is not stable
// across runs. Sort them by entity name before snapshotting.
const sortValidationReportsByEntityName = (
  error: BaseGraphQLError,
): BaseGraphQLError => {
  const reportsByMetadataName = error.extensions?.errors;

  if (!isDefined(reportsByMetadataName)) {
    return error;
  }

  for (const reports of Object.values(reportsByMetadataName)) {
    if (Array.isArray(reports)) {
      (reports as FlatEntityValidationReport[]).sort((a, b) => {
        const nameA = a.flatEntityMinimalInformation?.name ?? '';
        const nameB = b.flatEntityMinimalInformation?.name ?? '';

        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      });
    }
  }

  return error;
};

describe('Object metadata creation should fail v2', () => {
  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneObjectMetadata({
        input: getMockCreateObjectInput(context),
        expectToFail: true,
      });

      expect(errors.length).toBe(1);

      const canonicalError = sortValidationReportsByEntityName(errors[0]);

      expect(canonicalError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(canonicalError),
      );
    },
  );
});
