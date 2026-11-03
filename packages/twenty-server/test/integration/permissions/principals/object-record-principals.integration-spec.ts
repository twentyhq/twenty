import { type TestPrincipalKind } from 'test/integration/permissions/utils/get-shared-test-principal.util';
import {
  buildObjectRecordCase,
  cleanUpObjectRecordCases,
  expectObjectRecordCase,
  seedObjectRecordCases,
} from 'test/integration/permissions/utils/object-record-cases.util';
import { type ObjectRecordApi } from 'test/integration/permissions/utils/object-record-operations.constant';

const PRINCIPAL_KINDS: TestPrincipalKind[] = ['user', 'apiKey'];

const OBJECT_RECORD_APIS: ObjectRecordApi[] = ['graphql', 'rest'];

// The role is resolved from the auth context before any operation check, so
// each principal kind only needs to prove its own role is the one enforced.
describe('object record permissions by principal kind', () => {
  const objectRecordCases = PRINCIPAL_KINDS.flatMap((principalKind) =>
    OBJECT_RECORD_APIS.flatMap((api) => [
      buildObjectRecordCase({
        operation: 'findMany',
        api,
        principalKind,
        roleKey: 'onlyRead',
        expectation: 'allowed',
      }),
      buildObjectRecordCase({
        operation: 'findMany',
        api,
        principalKind,
        roleKey: 'noRecordAccess',
        expectation: 'denied',
      }),
      buildObjectRecordCase({
        operation: 'updateOne',
        api,
        principalKind,
        roleKey: 'onlyRead',
        expectation: 'denied',
      }),
    ]),
  );

  beforeAll(() => seedObjectRecordCases(objectRecordCases));

  afterAll(() => cleanUpObjectRecordCases(objectRecordCases));

  it.each(objectRecordCases)(
    '$operation via $api as $principalKind with $roleKey is $expectation',
    expectObjectRecordCase,
  );
});
