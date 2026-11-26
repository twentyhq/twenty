import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const expectNotInternalServerErrorsSnapshot = ({
  errors,
}: {
  errors: BaseGraphQLError[];
}) => {
  expect(errors.length).toBeGreaterThan(0);

  for (const error of errors) {
    expect(error.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  }

  // Resolvers settle in no fixed order, so neither do their errors
  const errorsForSnapshot = {
    errors: [...errors].sort((errorA, errorB) =>
      JSON.stringify(errorA).localeCompare(JSON.stringify(errorB)),
    ),
  };

  expect(errorsForSnapshot).toMatchSnapshot(
    extractRecordIdsAndDatesAsExpectAny(errorsForSnapshot),
  );
};
