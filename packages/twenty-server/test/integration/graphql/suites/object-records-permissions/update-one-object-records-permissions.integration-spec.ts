import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
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
          jobTitle: 'Senior Software Engineer',
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
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

      await makeGraphqlAPIRequest(createPersonOperation);

      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IsPermissionsV2Enabled',
        true,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);

      const findAllPetsViewOperation = findOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: 'id',
        filter: {
          icon: {
            eq: 'IconCat',
          },
        },
      });

      const findAllPetsViewResponse = await makeGraphqlAPIRequest(
        findAllPetsViewOperation,
      );

      allPetsViewId = findAllPetsViewResponse.body.data.view.id;
    });

    afterAll(async () => {
      const disablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        'IsPermissionsV2Enabled',
        false,
      );

      await makeGraphqlAPIRequest(disablePermissionsQuery);

      const updateViewOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'view',
        gqlFields: 'id',
        recordId: allPetsViewId,
        data: {
          icon: 'IconCat',
        },
      });

      await makeGraphqlAPIRequest(updateViewOperation);
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

      const response =
        await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateView).toBeDefined();
      expect(response.body.data.updateView.id).toBe(allPetsViewId);
      expect(response.body.data.updateView.icon).toBe('IconDog');
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

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
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

      const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updatePerson).toBeDefined();
      expect(response.body.data.updatePerson.id).toBe(personId);
      expect(response.body.data.updatePerson.jobTitle).toBe(
        'Senior Software Engineer',
      );
    });
  });
});
