import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const expectOneNotInternalServerErrorSnapshot = ({
  errors,
}: {
  errors: BaseGraphQLError[];
}) => {
  expect(errors.length).toBe(1);
  const [firstError] = errors;

  expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
  expect(firstError).toMatchSnapshot(
    extractRecordIdsAndDatesAsExpectAny(firstError),
  );
};
