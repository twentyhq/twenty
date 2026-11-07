import { randomUUID } from 'node:crypto';

import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import {
  type ApiKeyWithObjectRecordGrants,
  createApiKeyWithObjectRecordGrants,
} from 'test/integration/permissions/utils/create-api-key-with-object-record-grants.util';
import { deleteApiKeysWithObjectRecordGrants } from 'test/integration/permissions/utils/delete-api-keys-with-object-record-grants.util';
import { expectPermissionDeniedResponse } from 'test/integration/permissions/utils/expect-permission-denied-response.util';
import { expectPermissionGrantedResponse } from 'test/integration/permissions/utils/expect-permission-granted-response.util';
import { createPersonRecords } from 'test/integration/utils/create-person-records.util';
import { destroyPersonRecordsByFirstName } from 'test/integration/utils/destroy-person-records-by-first-name.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { findPersonRecordStates } from 'test/integration/utils/find-person-record-states.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { PERSON_RECORD_FIXTURE } from 'test/integration/utils/person-record-fixture.constant';
import {
  personRequestsByApi,
  type RecordApi,
} from 'test/integration/utils/person-requests-by-api.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const API: RecordApi = 'graphql';

const setCreatePermissionFlag = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED,
    value,
    expectToFail: false,
  });

const recomputeCaches = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatObjectMetadataMaps',
    'flatRoleMaps',
    'flatObjectPermissionMaps',
    'rolesPermissions',
  ]);

const setRoleCreatePermission = ({
  roleId,
  canCreateAllObjectRecords,
}: {
  roleId: string;
  canCreateAllObjectRecords: boolean;
}) =>
  global.testDataSource.query(
    'UPDATE core."role" SET "canCreateAllObjectRecords" = $2 WHERE id = $1',
    [roleId, canCreateAllObjectRecords],
  );

const setPersonDisabledActions = ({
  objectMetadataId,
  disabledObjectPermissionActions,
}: {
  objectMetadataId: string;
  disabledObjectPermissionActions: string[] | null;
}) =>
  global.testDataSource.query(
    'UPDATE core."objectMetadata" SET "disabledObjectPermissionActions" = $2 WHERE id = $1',
    [
      objectMetadataId,
      isDefined(disabledObjectPermissionActions)
        ? JSON.stringify(disabledObjectPermissionActions)
        : null,
    ],
  );

const createPerson = (token: string, jobTitle?: string) => {
  const id = randomUUID();

  return personRequestsByApi
    .createOne({
      api: API,
      token,
      data: {
        id,
        name: { firstName: PERSON_RECORD_FIXTURE.firstName },
        jobTitle,
      },
    })
    .then((response) => ({ id, response }));
};

const expectCreateDenied = async (token: string) => {
  const { id, response } = await createPerson(token);

  expectPermissionDeniedResponse({ api: API, response });
  expect(await findPersonRecordStates([id])).toEqual([{ status: 'absent' }]);
};

const expectCreateGranted = async (token: string) => {
  const { id, response } = await createPerson(token);

  expectPermissionGrantedResponse({ api: API, response });
  expect(await findPersonRecordStates([id])).toEqual([
    { status: 'active', jobTitle: '' },
  ]);
};

// Row-level roles only reach records with a job title
const expectRowLevelCreateDenied = async (token: string) => {
  const { id, response } = await createPerson(
    token,
    PERSON_RECORD_FIXTURE.jobTitle,
  );

  expectPermissionDeniedResponse({ api: API, response });
  expect(await findPersonRecordStates([id])).toEqual([{ status: 'absent' }]);
};

const expectRowLevelCreateGranted = async (token: string) => {
  const { id, response } = await createPerson(
    token,
    PERSON_RECORD_FIXTURE.jobTitle,
  );

  expectPermissionGrantedResponse({ api: API, response });
  expect(await findPersonRecordStates([id])).toEqual([
    { status: 'active', jobTitle: PERSON_RECORD_FIXTURE.jobTitle },
  ]);
};

const expectCreateDisabled = async (token: string) => {
  const { id, response } = await createPerson(token);

  expect(response.body.errors).toHaveLength(1);
  expect(response.body.errors[0].message).toBe(
    `${PermissionsExceptionMessage.PERMISSION_DENIED}: records of "person" are not writable through the API`,
  );
  expect(await findPersonRecordStates([id])).toEqual([{ status: 'absent' }]);
};

const updatePerson = ({ token, id }: { token: string; id: string }) =>
  personRequestsByApi.updateOne({
    api: API,
    token,
    id,
    data: { jobTitle: 'Updated job title' },
  });

describe('IS_CREATE_RECORDS_PERMISSION_ENABLED', () => {
  let personObjectMetadataId: string;
  let personDisabledActions: string[] | null;
  let updateWithoutCreate: ApiKeyWithObjectRecordGrants;
  let createWithoutUpdate: ApiKeyWithObjectRecordGrants;
  let objectOverrideWithoutCreate: ApiKeyWithObjectRecordGrants;
  let updateAndCreate: ApiKeyWithObjectRecordGrants;
  let rowLevelUpdateWithoutCreate: ApiKeyWithObjectRecordGrants;
  let rowLevelCreateWithoutUpdate: ApiKeyWithObjectRecordGrants;

  beforeAll(async () => {
    personObjectMetadataId = await findObjectMetadataIdByName('person');

    const [person] = await global.testDataSource.query(
      'SELECT "disabledObjectPermissionActions" FROM core."objectMetadata" WHERE id = $1',
      [personObjectMetadataId],
    );

    personDisabledActions = person.disabledObjectPermissionActions;

    const readAndUpdate = {
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
    };

    [
      updateWithoutCreate,
      createWithoutUpdate,
      objectOverrideWithoutCreate,
      updateAndCreate,
      rowLevelUpdateWithoutCreate,
      rowLevelCreateWithoutUpdate,
    ] = await Promise.all([
      createApiKeyWithObjectRecordGrants(readAndUpdate),
      createApiKeyWithObjectRecordGrants({ canReadAllObjectRecords: true }),
      createApiKeyWithObjectRecordGrants(readAndUpdate),
      createApiKeyWithObjectRecordGrants(readAndUpdate),
      createApiKeyWithObjectRecordGrants(readAndUpdate),
      createApiKeyWithObjectRecordGrants({ canReadAllObjectRecords: true }),
    ]);

    const jobTitleFieldMetadataId = await findFieldMetadataIdByName({
      objectMetadataId: personObjectMetadataId,
      fieldName: 'jobTitle',
    });

    for (const { roleId } of [
      rowLevelUpdateWithoutCreate,
      rowLevelCreateWithoutUpdate,
    ]) {
      await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId: personObjectMetadataId,
          predicates: [
            {
              fieldMetadataId: jobTitleFieldMetadataId,
              operand: RowLevelPermissionPredicateOperand.IS_NOT_EMPTY,
            },
          ],
          predicateGroups: [],
        },
      });
    }

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: objectOverrideWithoutCreate.roleId,
        objectPermissions: [
          {
            objectMetadataId: personObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
          },
        ],
      },
    });

    // The API keeps create in step with update, so only the database can tell them apart
    await setRoleCreatePermission({
      roleId: updateWithoutCreate.roleId,
      canCreateAllObjectRecords: false,
    });
    await setRoleCreatePermission({
      roleId: createWithoutUpdate.roleId,
      canCreateAllObjectRecords: true,
    });
    await setRoleCreatePermission({
      roleId: rowLevelUpdateWithoutCreate.roleId,
      canCreateAllObjectRecords: false,
    });
    await setRoleCreatePermission({
      roleId: rowLevelCreateWithoutUpdate.roleId,
      canCreateAllObjectRecords: true,
    });
    await global.testDataSource.query(
      'UPDATE core."objectPermission" SET "canCreateObjectRecords" = FALSE WHERE "roleId" = $1 AND "objectMetadataId" = $2',
      [objectOverrideWithoutCreate.roleId, personObjectMetadataId],
    );
    await recomputeCaches();
  });

  afterEach(async () => {
    await setPersonDisabledActions({
      objectMetadataId: personObjectMetadataId,
      disabledObjectPermissionActions: personDisabledActions,
    });
    await recomputeCaches();
  });

  afterAll(async () => {
    await setCreatePermissionFlag(false);
    await deleteApiKeysWithObjectRecordGrants([
      updateWithoutCreate,
      createWithoutUpdate,
      objectOverrideWithoutCreate,
      updateAndCreate,
      rowLevelUpdateWithoutCreate,
      rowLevelCreateWithoutUpdate,
    ]);
    await destroyPersonRecordsByFirstName(PERSON_RECORD_FIXTURE.firstName);
  });

  describe('when off', () => {
    beforeEach(() => setCreatePermissionFlag(false));

    it('lets create follow update, whatever the create permission says', async () => {
      await expectCreateGranted(updateWithoutCreate.token);
      await expectCreateGranted(objectOverrideWithoutCreate.token);
      await expectCreateDenied(createWithoutUpdate.token);
    });

    it('lets row-level create follow update', async () => {
      await expectRowLevelCreateGranted(rowLevelUpdateWithoutCreate.token);
      await expectRowLevelCreateDenied(rowLevelCreateWithoutUpdate.token);
    });

    it('ignores create when it is the only disabled action', async () => {
      await setPersonDisabledActions({
        objectMetadataId: personObjectMetadataId,
        disabledObjectPermissionActions: ['canCreateObjectRecords'],
      });
      await recomputeCaches();

      await expectCreateGranted(updateAndCreate.token);
    });

    it('blocks create when update is disabled', async () => {
      await setPersonDisabledActions({
        objectMetadataId: personObjectMetadataId,
        disabledObjectPermissionActions: ['canUpdateObjectRecords'],
      });
      await recomputeCaches();

      await expectCreateDisabled(updateAndCreate.token);
    });
  });

  describe('when on', () => {
    beforeEach(() => setCreatePermissionFlag(true));

    it('checks the role create permission rather than update', async () => {
      await expectCreateDenied(updateWithoutCreate.token);
      await expectCreateGranted(createWithoutUpdate.token);
      await expectCreateGranted(updateAndCreate.token);
    });

    it('checks the create permission on a role with row-level rules', async () => {
      await expectRowLevelCreateDenied(rowLevelUpdateWithoutCreate.token);
      await expectRowLevelCreateGranted(rowLevelCreateWithoutUpdate.token);
    });

    it('still requires created records to match the row-level rules', async () => {
      const { id, response } = await createPerson(
        rowLevelCreateWithoutUpdate.token,
      );

      expect(response.body.errors).toHaveLength(1);
      expect(await findPersonRecordStates([id])).toEqual([
        { status: 'absent' },
      ]);
    });

    it('leaves update alone', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      expectPermissionGrantedResponse({
        api: API,
        response: await updatePerson({ token: updateWithoutCreate.token, id }),
      });
      expectPermissionDeniedResponse({
        api: API,
        response: await updatePerson({ token: createWithoutUpdate.token, id }),
      });
    });

    it('checks the object create permission over the role', async () => {
      await expectCreateDenied(objectOverrideWithoutCreate.token);
    });

    it('blocks create when it is disabled, and leaves update alone', async () => {
      const [id] = await createPersonRecords({ count: 1 });

      await setPersonDisabledActions({
        objectMetadataId: personObjectMetadataId,
        disabledObjectPermissionActions: ['canCreateObjectRecords'],
      });
      await recomputeCaches();

      await expectCreateDisabled(updateAndCreate.token);
      expectPermissionGrantedResponse({
        api: API,
        response: await updatePerson({ token: updateAndCreate.token, id }),
      });
    });
  });
});
