import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('updateManyObjectRecordsPermissions', () => {
  const personId1 = randomUUID();
  const personId2 = randomUUID();

  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);

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

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
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

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

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
