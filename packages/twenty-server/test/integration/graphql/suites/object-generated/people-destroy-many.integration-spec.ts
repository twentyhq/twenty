import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('destroyPeople', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should emit a DESTROYED event for the destroyed records and none when repeated', async () => {
    const workspaceEventEmitter =
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter');
    const emitEventSpy = jest.spyOn(
      workspaceEventEmitter,
      'emitDatabaseBatchEvent',
    );

    const personId1 = randomUUID();
    const personId2 = randomUUID();

    const createResponse = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [{ id: personId1 }, { id: personId2 }],
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();
    emitEventSpy.mockClear();

    const destroyPeopleOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: { id: { in: [personId1, personId2] } },
    });

    const response = await makeGraphqlApiRequest(destroyPeopleOperation);

    expect(response.body.errors).toBeUndefined();
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

    const repeatResponse = await makeGraphqlApiRequest(destroyPeopleOperation);

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
