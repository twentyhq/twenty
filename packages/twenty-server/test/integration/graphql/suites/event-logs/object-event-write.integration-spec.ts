import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import gql from 'graphql-tag';

import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/object-event/object-record-created';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

// End-to-end write path: creating a record fires an objectEvent through
// entityEventsToDbQueue -> the consumer -> the ClickHouse sink.
describe('Object event write (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  let personObjectMetadataId: string;
  const testWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

  beforeAll(async () => {
    jest.useRealTimers();

    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    await deleteAllRecords('person');

    const response = await makeMetadataAPIRequest({
      query: gql`
        query {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                id
                nameSingular
              }
            }
          }
        }
      `,
    });

    personObjectMetadataId = response.body.data.objects.edges.find(
      (edge: { node: { id: string; nameSingular: string } }) =>
        edge.node.nameSingular === 'person',
    ).node.id;
  });

  afterAll(async () => {
    await deleteAllRecords('person');

    if (clickHouseClient) {
      await clickHouseClient.close();
    }
  });

  const queryObjectEventsByRecordId = (recordId: string) =>
    clickHouseClient
      .query({
        query: `
          SELECT event, recordId, objectMetadataId, workspaceId
          FROM objectEvent
          WHERE recordId = '${recordId}' AND workspaceId = '${testWorkspaceId}'
        `,
        format: 'JSONEachRow',
      })
      .then((result) =>
        result.json<{
          event: string;
          recordId: string;
          objectMetadataId: string;
          workspaceId: string;
        }>(),
      );

  it('writes an objectEvent row to ClickHouse when a record is created', async () => {
    const createResponse = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [{ name: { firstName: 'Event', lastName: 'Logged' } }],
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();

    const recordId = createResponse.body.data.createPeople[0].id;

    expect(recordId).toBeDefined();

    let rows: Awaited<ReturnType<typeof queryObjectEventsByRecordId>> = [];

    for (let attempt = 0; attempt < 20 && rows.length === 0; attempt++) {
      rows = await queryObjectEventsByRecordId(recordId);

      if (rows.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].event).toBe(OBJECT_RECORD_CREATED_EVENT);
    expect(rows[0].recordId).toBe(recordId);
    expect(rows[0].objectMetadataId).toBe(personObjectMetadataId);

    await clickHouseClient.command({
      query: `ALTER TABLE objectEvent DELETE WHERE recordId = '${recordId}'`,
    });
  });
});
