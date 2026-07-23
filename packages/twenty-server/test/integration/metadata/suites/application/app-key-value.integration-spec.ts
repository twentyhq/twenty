import gql from 'graphql-tag';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const GET_APP_KEY_VALUE = gql`
  query AppKeyValue($key: String!, $scope: AppKeyValueScope) {
    appKeyValue(key: $key, scope: $scope) {
      key
      value
      scope
    }
  }
`;

const SET_APP_KEY_VALUE = gql`
  mutation SetAppKeyValue($input: SetAppKeyValueInput!) {
    setAppKeyValue(input: $input) {
      key
      value
      scope
    }
  }
`;

const DELETE_APP_KEY_VALUE = gql`
  mutation DeleteAppKeyValue($key: String!, $scope: AppKeyValueScope) {
    deleteAppKeyValue(key: $key, scope: $scope)
  }
`;

const KEY_PREFIX = `test-kv-${uuidv4()}`;

describe('application key-value store (e2e)', () => {
  let appToken: string;

  beforeAll(async () => {
    const { data } = await findManyApplications({ expectToFail: false });

    const standardApplication = data.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(standardApplication).toBeDefined();

    const { data: tokenData } = await generateApplicationToken({
      applicationId: standardApplication!.id,
      expectToFail: false,
    });

    appToken = tokenData.generateApplicationToken.applicationAccessToken.token;
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."keyValuePair" WHERE "key" LIKE $1`,
      [`${KEY_PREFIX}%`],
    );
  });

  it('rejects requests that do not carry an APPLICATION_ACCESS token', async () => {
    const response = await makeMetadataAPIRequest({
      query: GET_APP_KEY_VALUE,
      variables: { key: `${KEY_PREFIX}:no-app-token` },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('APPLICATION_ACCESS');
  });

  it('sets, reads, overwrites and deletes a WORKSPACE entry', async () => {
    const key = `${KEY_PREFIX}:workspace`;

    const setResponse = await makeMetadataAPIRequest(
      {
        query: SET_APP_KEY_VALUE,
        variables: { input: { key, value: { count: 1 } } },
      },
      appToken,
    );

    expect(setResponse.body.errors).toBeUndefined();
    expect(setResponse.body.data.setAppKeyValue).toEqual({
      key,
      value: { count: 1 },
      scope: 'WORKSPACE',
    });

    const overwriteResponse = await makeMetadataAPIRequest(
      {
        query: SET_APP_KEY_VALUE,
        variables: { input: { key, value: 'overwritten' } },
      },
      appToken,
    );

    expect(overwriteResponse.body.errors).toBeUndefined();

    const getResponse = await makeMetadataAPIRequest(
      { query: GET_APP_KEY_VALUE, variables: { key } },
      appToken,
    );

    expect(getResponse.body.errors).toBeUndefined();
    expect(getResponse.body.data.appKeyValue.value).toBe('overwritten');

    const deleteResponse = await makeMetadataAPIRequest(
      { query: DELETE_APP_KEY_VALUE, variables: { key } },
      appToken,
    );

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteAppKeyValue).toBe(true);

    const getAfterDeleteResponse = await makeMetadataAPIRequest(
      { query: GET_APP_KEY_VALUE, variables: { key } },
      appToken,
    );

    expect(getAfterDeleteResponse.body.data.appKeyValue).toBeNull();

    const deleteAgainResponse = await makeMetadataAPIRequest(
      { query: DELETE_APP_KEY_VALUE, variables: { key } },
      appToken,
    );

    expect(deleteAgainResponse.body.data.deleteAppKeyValue).toBe(false);
  });

  it('returns null for a missing key', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: GET_APP_KEY_VALUE,
        variables: { key: `${KEY_PREFIX}:missing` },
      },
      appToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.appKeyValue).toBeNull();
  });

  it('claims a SERVER key for the caller workspace and keeps it separate from WORKSPACE entries', async () => {
    const key = `${KEY_PREFIX}:server`;

    const claimResponse = await makeMetadataAPIRequest(
      {
        query: SET_APP_KEY_VALUE,
        variables: { input: { key, scope: 'SERVER' } },
      },
      appToken,
    );

    expect(claimResponse.body.errors).toBeUndefined();
    expect(claimResponse.body.data.setAppKeyValue).toEqual({
      key,
      value: SEED_APPLE_WORKSPACE_ID,
      scope: 'SERVER',
    });

    // Claiming again from the same workspace is idempotent
    const reclaimResponse = await makeMetadataAPIRequest(
      {
        query: SET_APP_KEY_VALUE,
        variables: { input: { key, scope: 'SERVER' } },
      },
      appToken,
    );

    expect(reclaimResponse.body.errors).toBeUndefined();
    expect(reclaimResponse.body.data.setAppKeyValue.value).toBe(
      SEED_APPLE_WORKSPACE_ID,
    );

    const getServerScopeResponse = await makeMetadataAPIRequest(
      { query: GET_APP_KEY_VALUE, variables: { key, scope: 'SERVER' } },
      appToken,
    );

    expect(getServerScopeResponse.body.data.appKeyValue.value).toBe(
      SEED_APPLE_WORKSPACE_ID,
    );

    const getWorkspaceScopeResponse = await makeMetadataAPIRequest(
      { query: GET_APP_KEY_VALUE, variables: { key } },
      appToken,
    );

    expect(getWorkspaceScopeResponse.body.data.appKeyValue).toBeNull();

    const releaseResponse = await makeMetadataAPIRequest(
      { query: DELETE_APP_KEY_VALUE, variables: { key, scope: 'SERVER' } },
      appToken,
    );

    expect(releaseResponse.body.data.deleteAppKeyValue).toBe(true);

    const getAfterReleaseResponse = await makeMetadataAPIRequest(
      { query: GET_APP_KEY_VALUE, variables: { key, scope: 'SERVER' } },
      appToken,
    );

    expect(getAfterReleaseResponse.body.data.appKeyValue).toBeNull();
  });

  it('ignores a provided value for SERVER claims and stores the caller workspaceId', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: SET_APP_KEY_VALUE,
        variables: {
          input: {
            key: `${KEY_PREFIX}:server-foreign-value`,
            value: 'some-other-workspace-id',
            scope: 'SERVER',
          },
        },
      },
      appToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.setAppKeyValue.value).toBe(SEED_APPLE_WORKSPACE_ID);
  });
});
