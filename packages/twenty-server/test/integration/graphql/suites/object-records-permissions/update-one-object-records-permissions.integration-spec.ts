import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

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

      await makeGraphqlAPIRequest({
        operation: createPersonOperation,
      });
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

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ updatePerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should update an object record when user has permission (admin role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePerson).toBeDefined();
      expect(response.data.updatePerson.id).toBe(personId);
      expect(response.data.updatePerson.jobTitle).toBe(
        'Senior Software Engineer',
      );
    });
  });

  describe('permissions V2 enabled', () => {
    const personId = randomUUID();
    let allPetsViewId: string;

    beforeAll(async () => {
      const createPersonOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personId,
          jobTitle: 'Software Engineer',
        },
      });

      await makeGraphqlAPIRequest({
        operation: createPersonOperation,
      });

      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IS_PERMISSIONS_V2_ENABLED',
        true,
      );

      await makeGraphqlAPIRequest({
        operation: enablePermissionsQuery,
      });

      const findAllPetsViewOperation = findOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: 'id',
        filter: {
          icon: {
            eq: 'IconCat',
          },
        },
      });

      const findAllPetsViewResponse = await makeGraphqlAPIRequest<any>({
        operation: findAllPetsViewOperation,
      });

      allPetsViewId = findAllPetsViewResponse.data.view.id;
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

      const updateViewOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: 'id',
        recordId: allPetsViewId,
        data: {
          icon: 'IconCat',
        },
      });

      await makeGraphqlAPIRequest({
        operation: updateViewOperation,
      });
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

      const response = await makeGraphqlAPIRequest({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toStrictEqual({ updatePerson: null });
      expect(response.errors).toBeDefined();
      expect(response.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(response.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should allow to update a system object record even without update permission (guest role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: `
          id
          icon
        `,
        recordId: allPetsViewId,
        data: {
          icon: 'IconDog',
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'GUEST',
        },
      });

      expect(response.data).toBeDefined();
      expect(response.data.updateView).toBeDefined();
      expect(response.data.updateView.id).toBe(allPetsViewId);
      expect(response.data.updateView.icon).toBe('IconDog');
    });

    it('should update an object record when user has permission (admin role)', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePerson).toBeDefined();
      expect(response.data.updatePerson.id).toBe(personId);
      expect(response.data.updatePerson.jobTitle).toBe(
        'Senior Software Engineer',
      );
    });

    it('should update an object record when executed by api key', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: personId,
        data: {
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequest<any>({
        operation: graphqlOperation,
        options: {
          testingToken: 'API_KEY',
        },
      });

      expect(response.data).toBeDefined();
      expect(response.data.updatePerson).toBeDefined();
      expect(response.data.updatePerson.id).toBe(personId);
      expect(response.data.updatePerson.jobTitle).toBe(
        'Senior Software Engineer',
      );
    });
  });
});
