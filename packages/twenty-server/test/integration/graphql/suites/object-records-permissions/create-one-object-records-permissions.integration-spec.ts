import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe('createOneObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: randomUUID(),
        },
      });

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ createPerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should create an object record when user has permission (admin role)', async () => {
      const personId = randomUUID();
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.createPerson).toBeDefined();
      expect(response.data.createPerson.id).toBe(personId);
    });
  });

  describe('permissions V2 enabled', () => {
    beforeAll(async () => {
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest({ operation: enablePermissionsQuery });
    });

    afterAll(async () => {
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest({ operation: disablePermissionsQuery });
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: randomUUID(),
        },
      });

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ createPerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should create an object record when user has permission (admin role)', async () => {
      const personId = randomUUID();
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.createPerson).toBeDefined();
      expect(response.data.createPerson.id).toBe(personId);
    });

    it('should create an object record when executed by api key', async () => {
      const personId = randomUUID();
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'API_KEY',
        },
      });

      expect(response.data).toBeDefined();
      expect(response.data.createPerson).toBeDefined();
      expect(response.data.createPerson.id).toBe(personId);
    });
  });
});
