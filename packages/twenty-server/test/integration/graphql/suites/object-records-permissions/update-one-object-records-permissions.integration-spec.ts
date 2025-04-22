import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('updateOneObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    const personId = randomUUID();

    beforeAll(async () => {
      const createPersonOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
          jobTitle: 'Software Engineer',
        },
      });

      await makeGraphqlAPIRequest(createPersonOperation);
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ updatePerson: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update an object record when user has permission (admin role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Solutions architect',
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
        'Solutions architect',
      );
    });
  });

  describe('permissions V2 enabled', () => {
    beforeAll(async () => {
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IsPermissionsV2Enabled',
        true,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);
    });

    afterAll(async () => {
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IsPermissionsV2Enabled',
        false,
      );

      await makeGraphqlAPIRequest(disablePermissionsQuery);
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const personId = randomUUID();
      const createGraphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequestWithGuestRole(
        updateGraphqlOperation,
      );

      expect(response.body.data).toStrictEqual({ updatePerson: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update an object record when user has permission (admin role)', async () => {
      const personId = randomUUID();
      const createGraphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Intermediary Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
        'Intermediary Software Engineer',
      );
    });

    it('should update an object record when executed by api key', async () => {
      const personId = randomUUID();
      const createGraphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
        },
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Junior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequestWithApiKey(
        updateGraphqlOperation,
      );

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
        'Junior Software Engineer',
      );
    });
  });
});
