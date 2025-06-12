import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

describe('createManyObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const graphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            id: randomUUID(),
          },
          {
            id: randomUUID(),
          },
        ],
      });

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ createPeople: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should create multiple object records when user has permission (admin role)', async () => {
      const personId1 = randomUUID();
      const personId2 = randomUUID();

      const graphqlOperation = createManyOperationFactory({
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

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.createPeople).toBeDefined();
      expect(response.data.createPeople).toHaveLength(2);
      expect(response.data.createPeople[0].id).toBe(personId1);
      expect(response.data.createPeople[1].id).toBe(personId2);
    });
  });

  // describe('permissions V2 enabled', () => {
  //   beforeAll(async () => {
  //     const enablePermissionsQuery = updateFeatureFlagFactory(
  //       SEED_APPLE_WORKSPACE_ID,
  //       'IS_PERMISSIONS_V2_ENABLED',
  //       true,
  //     );

  //     await makeGraphqlAPIRequest(enablePermissionsQuery);
  //   });

  //   afterAll(async () => {
  //     const disablePermissionsQuery = updateFeatureFlagFactory(
  //       SEED_APPLE_WORKSPACE_ID,
  //       'IS_PERMISSIONS_V2_ENABLED',
  //       false,
  //     );

  //     await makeGraphqlAPIRequest(disablePermissionsQuery);
  //   });

  //   it('should throw a permission error when user does not have permission (guest role)', async () => {
  //     const graphqlOperation = createManyOperationFactory({
  //       objectMetadataSingularName: 'person',
  //       objectMetadataPluralName: 'people',
  //       gqlFields: PERSON_GQL_FIELDS,
  //       data: [
  //         {
  //           id: randomUUID(),
  //         },
  //         {
  //           id: randomUUID(),
  //         },
  //       ],
  //     });

  //     const response =
  //       await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

  //     expect(response.body.data).toStrictEqual({ createPeople: null });
  //     expect(response.body.errors).toBeDefined();
  //     expect(response.body.errors[0].message).toBe(
  //       PermissionsExceptionMessage.PERMISSION_DENIED,
  //     );
  //     expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  //   });

  //   it('should create multiple object records when user has permission (admin role)', async () => {
  //     const personId1 = randomUUID();
  //     const personId2 = randomUUID();

  //     const graphqlOperation = createManyOperationFactory({
  //       objectMetadataSingularName: 'person',
  //       objectMetadataPluralName: 'people',
  //       gqlFields: PERSON_GQL_FIELDS,
  //       data: [
  //         {
  //           id: personId1,
  //         },
  //         {
  //           id: personId2,
  //         },
  //       ],
  //     });

  //     const response = await makeGraphqlAPIRequest(graphqlOperation);

  //     expect(response.body.data).toBeDefined();
  //     expect(response.body.data.createPeople).toBeDefined();
  //     expect(response.body.data.createPeople).toHaveLength(2);
  //     expect(response.body.data.createPeople[0].id).toBe(personId1);
  //     expect(response.body.data.createPeople[1].id).toBe(personId2);
  //   });

  //   it('should create multiple object records when executed by api key', async () => {
  //     const personId1 = randomUUID();
  //     const personId2 = randomUUID();

  //     const graphqlOperation = createManyOperationFactory({
  //       objectMetadataSingularName: 'person',
  //       objectMetadataPluralName: 'people',
  //       gqlFields: PERSON_GQL_FIELDS,
  //       data: [
  //         {
  //           id: personId1,
  //         },
  //         {
  //           id: personId2,
  //         },
  //       ],
  //     });

  //     const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

  //     expect(response.body.data).toBeDefined();
  //     expect(response.body.data.createPeople).toBeDefined();
  //     expect(response.body.data.createPeople).toHaveLength(2);
  //     expect(response.body.data.createPeople[0].id).toBe(personId1);
  //     expect(response.body.data.createPeople[1].id).toBe(personId2);
  //   });
  // });
});
