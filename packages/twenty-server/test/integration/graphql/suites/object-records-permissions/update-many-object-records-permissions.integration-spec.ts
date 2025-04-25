import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('updateManyObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    const personId1 = randomUUID();
    const personId2 = randomUUID();

    beforeAll(async () => {
      const createGraphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            id: personId1,
          },
          {
            id: personId2,
          },
        ],
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [randomUUID(), randomUUID()],
          },
        },
        data: {
          jobTitle: 'Architect',
        },
      });

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ updatePeople: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update multiple object records when user has permission (admin role)', async () => {
      const graphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
        data: {
          jobTitle: 'Architect',
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePeople).toBeDefined();
      expect(response.body.data.updatePeople).toHaveLength(2);
      expect(response.body.data.updatePeople[0].jobTitle).toBe('Architect');
      expect(response.body.data.updatePeople[1].jobTitle).toBe('Architect');
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
      const personId1 = randomUUID();
      const personId2 = randomUUID();
      const createGraphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            id: personId1,
          },
          {
            id: personId2,
          },
        ],
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
        data: {
          jobTitle: 'Senior Developer',
        },
      });

      const response = await makeGraphqlAPIRequestWithGuestRole(
        updateGraphqlOperation,
      );

      expect(response.body.data).toStrictEqual({ updatePeople: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update multiple object records when user has permission (admin role)', async () => {
      const personId1 = randomUUID();
      const personId2 = randomUUID();
      const createGraphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            id: personId1,
          },
          {
            id: personId2,
          },
        ],
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
        data: {
          jobTitle: 'Tech Lead',
        },
      });

      const response = await makeGraphqlAPIRequest(updateGraphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePeople).toBeDefined();
      expect(response.body.data.updatePeople).toHaveLength(2);
      expect(response.body.data.updatePeople[0].id).toBe(personId1);
      expect(response.body.data.updatePeople[1].id).toBe(personId2);
      expect(response.body.data.updatePeople[0].jobTitle).toBe('Tech Lead');
      expect(response.body.data.updatePeople[1].jobTitle).toBe('Tech Lead');
    });

    it('should update multiple object records when executed by api key', async () => {
      const personId1 = randomUUID();
      const personId2 = randomUUID();
      const createGraphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            id: personId1,
          },
          {
            id: personId2,
          },
        ],
      });

      await makeGraphqlAPIRequest(createGraphqlOperation);

      const updateGraphqlOperation = updateManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
        data: {
          jobTitle: 'Product Manager',
        },
      });

      const response = await makeGraphqlAPIRequestWithApiKey(
        updateGraphqlOperation,
      );

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePeople).toBeDefined();
      expect(response.body.data.updatePeople).toHaveLength(2);
      expect(response.body.data.updatePeople[0].id).toBe(personId1);
      expect(response.body.data.updatePeople[1].id).toBe(personId2);
      expect(response.body.data.updatePeople[0].jobTitle).toBe(
        'Product Manager',
      );
      expect(response.body.data.updatePeople[1].jobTitle).toBe(
        'Product Manager',
      );
    });
  });
});
