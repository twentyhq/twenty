import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('deleteManyObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [randomUUID(), randomUUID()],
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ deletePeople: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should delete multiple object records when user has permission (admin role)', async () => {
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

      const deleteGraphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
      });

      const response = await makeGraphqlAPIRequest(deleteGraphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.deletePeople).toBeDefined();
      expect(response.body.data.deletePeople).toHaveLength(2);
      expect(response.body.data.deletePeople[0].id).toBe(personId1);
      expect(response.body.data.deletePeople[1].id).toBe(personId2);
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
      const graphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [randomUUID(), randomUUID()],
          },
        },
      });

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toStrictEqual({ deletePeople: null });
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should delete multiple object records when user has permission (admin role)', async () => {
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

      const deleteGraphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
      });

      const response = await makeGraphqlAPIRequest(deleteGraphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.deletePeople).toBeDefined();
      expect(response.body.data.deletePeople).toHaveLength(2);
      expect(response.body.data.deletePeople[0].id).toBe(personId1);
      expect(response.body.data.deletePeople[1].id).toBe(personId2);
    });

    it('should delete multiple object records when executed by api key', async () => {
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

      const deleteGraphqlOperation = deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
      });

      const response = await makeGraphqlAPIRequestWithApiKey(
        deleteGraphqlOperation,
      );

      expect(response.body.data).toBeDefined();
      expect(response.body.data.deletePeople).toBeDefined();
      expect(response.body.data.deletePeople).toHaveLength(2);
      expect(response.body.data.deletePeople[0].id).toBe(personId1);
      expect(response.body.data.deletePeople[1].id).toBe(personId2);
    });
  });
});
