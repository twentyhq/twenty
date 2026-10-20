import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const TARGET_OBJECT_NAMES = [
  'messageThreadTarget',
  'calendarEventTarget',
] as const;

type TargetObjectName = (typeof TARGET_OBJECT_NAMES)[number];

describe('communication targets for opportunities', () => {
  let personId: string;
  let companyId: string;
  let otherCompanyId: string;
  let messageThreadId: string;
  let calendarEventId: string;
  const fixtures: { objectName: string; id: string }[] = [];

  const create = async (objectName: string, input: object) => {
    const id = randomUUID();
    const response = await createOneOperation({
      objectMetadataSingularName: objectName,
      input: { id, ...input },
    });

    expect(response.errors).toBeUndefined();
    fixtures.push({ objectName, id });

    return id;
  };

  const createOpportunity = async (input: object) => {
    const opportunityId = await create('opportunity', {
      name: 'Target attribution opportunity',
      ...input,
    });

    await waitForAllJobsToFinish();

    return opportunityId;
  };

  const updateOpportunity = async (opportunityId: string, data: object) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        recordId: opportunityId,
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const findOpportunityIds = async (
    objectName: TargetObjectName,
  ): Promise<string[]> => {
    const parentField =
      objectName === 'messageThreadTarget'
        ? 'messageThreadId'
        : 'calendarEventId';
    const parentId =
      objectName === 'messageThreadTarget' ? messageThreadId : calendarEventId;
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: objectName,
        objectMetadataPluralName: `${objectName}s`,
        filter: { [parentField]: { eq: parentId } },
        gqlFields: 'id targetOpportunityId',
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const targets: { id: string; targetOpportunityId: string | null }[] =
      response.body.data[`${objectName}s`].edges.map(
        ({ node }: { node: object }) => node,
      );

    for (const target of targets) {
      if (!fixtures.some(({ id }) => id === target.id)) {
        fixtures.push({ objectName, id: target.id });
      }
    }

    return targets
      .map(({ targetOpportunityId }) => targetOpportunityId)
      .filter((id): id is string => id !== null);
  };

  beforeEach(async () => {
    companyId = await create('company', { name: 'Attendee company' });
    otherCompanyId = await create('company', { name: 'Other company' });
    personId = await create('person', {
      name: { firstName: 'Attendee' },
      companyId,
    });
    messageThreadId = await create('messageThread', {});
    const messageId = await create('message', {
      messageThreadId,
      subject: 'Opportunity attribution',
      receivedAt: '2026-01-01T12:00:00.000Z',
    });

    await create('messageParticipant', {
      messageId,
      personId,
      handle: 'urn:contact:attendee',
      role: 'FROM',
    });
    calendarEventId = await create('calendarEvent', {
      title: 'Opportunity attribution',
      startsAt: '2026-01-01T12:00:00.000Z',
      endsAt: '2026-01-01T13:00:00.000Z',
    });
    await create('calendarEventParticipant', {
      calendarEventId,
      personId,
      handle: 'urn:contact:attendee',
    });
    await waitForAllJobsToFinish();
  });

  afterEach(async () => {
    for (const objectName of TARGET_OBJECT_NAMES) {
      await findOpportunityIds(objectName);
    }

    for (const { objectName, id } of fixtures.splice(0).reverse()) {
      const response = await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: objectName,
          recordId: id,
          gqlFields: 'id',
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  it("links existing emails and events to a new opportunity of an attendee's company", async () => {
    const opportunityId = await createOpportunity({ companyId });

    for (const objectName of TARGET_OBJECT_NAMES) {
      expect(await findOpportunityIds(objectName)).toEqual([opportunityId]);
    }
  });

  it('links existing emails and events when the point of contact is set later', async () => {
    const opportunityId = await createOpportunity({});

    await updateOpportunity(opportunityId, { pointOfContactId: personId });

    for (const objectName of TARGET_OBJECT_NAMES) {
      expect(await findOpportunityIds(objectName)).toEqual([opportunityId]);
    }
  });

  it('unlinks emails and events when the opportunity moves to another company', async () => {
    const opportunityId = await createOpportunity({ companyId });

    await updateOpportunity(opportunityId, { companyId: otherCompanyId });

    for (const objectName of TARGET_OBJECT_NAMES) {
      expect(await findOpportunityIds(objectName)).toEqual([]);
    }
  });
});
