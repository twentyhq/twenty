import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('destroyManyObjectRecordsPermissions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [randomUUID(), randomUUID()],
        },
      },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ destroyPeople: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should destroy multiple object records when user has permission (admin role)', async () => {
    const workspaceEventEmitter =
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter');
    const emitEventSpy = jest.spyOn(
      workspaceEventEmitter,
      'emitDatabaseBatchEvent',
    );
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

    const createResponse = await makeGraphqlAPIRequest(createGraphqlOperation);

    expect(createResponse.body.errors).toBeUndefined();
    emitEventSpy.mockClear();

    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [personId1, personId2],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data.destroyPeople).toBeDefined();
    expect(response.body.data.destroyPeople).toHaveLength(2);
    expect(response.body.data.destroyPeople).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: personId1 }),
        expect.objectContaining({ id: personId2 }),
      ]),
    );
    expect(emitEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataNameSingular: 'person',
        action: DatabaseEventAction.DESTROYED,
        events: expect.arrayContaining([
          expect.objectContaining({ recordId: personId1 }),
          expect.objectContaining({ recordId: personId2 }),
        ]),
      }),
    );

    emitEventSpy.mockClear();

    const repeatResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(repeatResponse.body.errors).toBeUndefined();
    expect(repeatResponse.body.data.destroyPeople).toEqual([]);
    expect(emitEventSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        objectMetadataNameSingular: 'person',
        action: DatabaseEventAction.DESTROYED,
      }),
    );
  });
});
