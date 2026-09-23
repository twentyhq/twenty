import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { isDefined } from 'twenty-shared/utils';

import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const expectOneNotInternalServerErrorSnapshot = ({
  errors,
  normalizeMessage,
}: {
  errors: BaseGraphQLError[];
  normalizeMessage?: (message: string) => string;
}) => {
  expect(errors.length).toBe(1);
  const [firstError] = errors;

  jestExpectToBeDefined(firstError);
  expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');

  const errorForSnapshot = isDefined(normalizeMessage)
    ? { ...firstError, message: normalizeMessage(firstError.message) }
    : firstError;

  expect(errorForSnapshot).toMatchSnapshot(
    extractRecordIdsAndDatesAsExpectAny(errorForSnapshot),
  );
};
