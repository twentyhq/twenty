import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

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

      await makeGraphqlAPIRequest({
        operation: createGraphqlOperation,
      });
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

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ updatePeople: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePeople).toBeDefined();
      expect(response.data.updatePeople).toHaveLength(2);
      expect(response.data.updatePeople[0].jobTitle).toBe('Architect');
      expect(response.data.updatePeople[1].jobTitle).toBe('Architect');
    });
  });

  describe('permissions V2 enabled', () => {
    beforeAll(async () => {
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest({
        operation: enablePermissionsQuery,
      });
    });

    afterAll(async () => {
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest({
        operation: disablePermissionsQuery,
      });
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

      await makeGraphqlAPIRequest({
        operation: createGraphqlOperation,
      });

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

      const response = await makeGraphqlAPIRequest({
        operation: updateGraphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ updatePeople: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

      await makeGraphqlAPIRequest({
        operation: createGraphqlOperation,
      });

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

      const response = await makeGraphqlAPIRequest<any>({
        operation: updateGraphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePeople).toBeDefined();
      expect(response.data.updatePeople).toHaveLength(2);
      expect(response.data.updatePeople[0].id).toBe(personId1);
      expect(response.data.updatePeople[1].id).toBe(personId2);
      expect(response.data.updatePeople[0].jobTitle).toBe('Tech Lead');
      expect(response.data.updatePeople[1].jobTitle).toBe('Tech Lead');
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

      await makeGraphqlAPIRequest({
        operation: createGraphqlOperation,
      });

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

      const response = await makeGraphqlAPIRequest<any>({
        operation: updateGraphqlOperation,
        options: {
          testingToken: 'API_KEY',
        },
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePeople).toBeDefined();
      expect(response.data.updatePeople).toHaveLength(2);
      expect(response.data.updatePeople[0].id).toBe(personId1);
      expect(response.data.updatePeople[1].id).toBe(personId2);
      expect(response.data.updatePeople[0].jobTitle).toBe(
        'Product Manager',
      );
      expect(response.data.updatePeople[1].jobTitle).toBe(
        'Product Manager',
      );
    });
  });
});
