import {
  buildObjectRecordCase,
  cleanUpObjectRecordCases,
  expectObjectRecordCase,
  seedObjectRecordCases,
} from 'test/integration/permissions/utils/object-record-cases.util';
import {
  OBJECT_RECORD_OPERATIONS,
  type ObjectRecordApi,
  type ObjectRecordGrant,
  type ObjectRecordOperationName,
} from 'test/integration/permissions/utils/object-record-operations.constant';
import { type SharedTestRoleKey } from 'test/integration/permissions/utils/shared-test-roles.constant';

const OBJECT_RECORD_APIS: ObjectRecordApi[] = ['graphql', 'rest'];

// Writes cannot be granted without read, so the denied role for a write grant
// keeps every other grant: only the missing one can explain the denial.
const DENIED_ROLE_KEY_BY_GRANT: Record<ObjectRecordGrant, SharedTestRoleKey> = {
  read: 'noRecordAccess',
  update: 'allExceptUpdate',
  softDelete: 'allExceptSoftDelete',
  destroy: 'allExceptDestroy',
};

const ALLOWED_ROLE_KEY_BY_GRANT: Record<ObjectRecordGrant, SharedTestRoleKey> =
  {
    read: 'onlyRead',
    update: 'readAndUpdate',
    softDelete: 'readAndSoftDelete',
    destroy: 'readAndDestroy',
  };

export const describeObjectRecordGrantTable = (grant: ObjectRecordGrant) => {
  const operationNames = (
    Object.keys(OBJECT_RECORD_OPERATIONS) as ObjectRecordOperationName[]
  ).filter(
    (operationName) =>
      OBJECT_RECORD_OPERATIONS[operationName].requiredGrant === grant,
  );

  const objectRecordCases = operationNames.flatMap((operation) =>
    OBJECT_RECORD_APIS.flatMap((api) => [
      buildObjectRecordCase({
        operation,
        api,
        principalKind: 'user',
        roleKey: DENIED_ROLE_KEY_BY_GRANT[grant],
        expectation: 'denied',
      }),
      buildObjectRecordCase({
        operation,
        api,
        principalKind: 'user',
        roleKey: ALLOWED_ROLE_KEY_BY_GRANT[grant],
        expectation: 'allowed',
      }),
    ]),
  );

  beforeAll(() => seedObjectRecordCases(objectRecordCases));

  afterAll(() => cleanUpObjectRecordCases(objectRecordCases));

  it.each(objectRecordCases)(
    '$operation via $api with $roleKey is $expectation',
    expectObjectRecordCase,
  );
};
