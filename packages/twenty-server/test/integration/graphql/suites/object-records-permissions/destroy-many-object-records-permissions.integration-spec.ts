import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe('destroyManyObjectRecordsPermissions', () => {
  describe('permissions V2 disabled', () => {
    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const operation = destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [randomUUID(), randomUUID()],
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ destroyPeople: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should destroy multiple object records when user has permission (admin role)', async () => {
      const personId1 = randomUUID();
      const personId2 = randomUUID();

      const createOperation = createManyOperationFactory({
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

      await makeGraphqlAPIRequest<any>({ operation: createOperation });

      const operation = destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({ operation });

      expect(response.data).toBeDefined();
      expect(response.data.destroyPeople).toBeDefined();
      expect(response.data.destroyPeople).toHaveLength(2);
      expect(response.data.destroyPeople[0].id).toBe(personId1);
      expect(response.data.destroyPeople[1].id).toBe(personId2);
    });
  });

  describe('permissions V2 enabled', () => {
    beforeAll(async () => {
      const operation = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest<any>({ operation });
    });

    afterAll(async () => {
      const operation = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        false,
      );

      await makeGraphqlAPIRequest<any>({ operation });
    });

    it('should throw a permission error when user does not have permission (guest role)', async () => {
      const operation = destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [randomUUID(), randomUUID()],
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ destroyPeople: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should destroy multiple object records when user has permission (admin role)', async () => {
      const personId1 = randomUUID();
      const personId2 = randomUUID();

      const createOperation = createManyOperationFactory({
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

      await makeGraphqlAPIRequest<any>({ operation: createOperation });

      const operation = destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            in: [personId1, personId2],
          },
        },
      });

      const response = await makeGraphqlAPIRequest<any>({ operation });

      expect(response.data).toBeDefined();
      expect(response.data.destroyPeople).toBeDefined();
      expect(response.data.destroyPeople).toHaveLength(2);
      expect(response.data.destroyPeople[0].id).toBe(personId1);
      expect(response.data.destroyPeople[1].id).toBe(personId2);
    });
  });
});
