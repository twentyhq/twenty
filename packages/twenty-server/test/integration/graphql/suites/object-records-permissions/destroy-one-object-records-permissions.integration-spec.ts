import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe('destroyOneObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    const personId = randomUUID();

    beforeAll(async () => {
      const operation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      await makeGraphqlAPIRequest({ operation });
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const operation = destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
      });

      const response = await makeGraphqlAPIRequest({
        operation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ destroyPerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should destroy an object record when user has permission (admin role)', async () => {
      const operation = destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
      });

      const response = await makeGraphqlAPIRequest<any>({ operation });

      expect(response.data).toBeDefined();
      expect(response.data.destroyPerson).toBeDefined();
      expect(response.data.destroyPerson.id).toBe(personId);
    });
  });

  describe('permissions V2 enabled', () => {
    const personId = randomUUID();

    beforeAll(async () => {
      const createOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      await makeGraphqlAPIRequest({ operation: createOperation });

      const operation = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest({ operation });
    });

    afterAll(async () => {
      const operation = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest({ operation });
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const personId = randomUUID();
      const operation = destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
      });

      const response = await makeGraphqlAPIRequest({
        operation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ destroyPerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should destroy an object record when user has permission (admin role)', async () => {
      const operation = destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
      });

      const response = await makeGraphqlAPIRequest<any>({ operation });

      expect(response.data).toBeDefined();
      expect(response.data.destroyPerson).toBeDefined();
      expect(response.data.destroyPerson.id).toBe(personId);
    });
  });
});
