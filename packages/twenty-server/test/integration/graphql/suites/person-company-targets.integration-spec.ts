import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

type Target = {
  id: string;
  targetCompanyId: string | null;
  targetPersonId: string | null;
  isAutomaticallyAssigned: boolean;
  isManuallyAssigned: boolean;
};

describe('communication targets after initial company assignment', () => {
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

  const updateCompany = async (newCompanyId: string) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: personId,
        gqlFields: 'id companyId',
        data: { companyId: newCompanyId },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const findTargets = async (
    objectName: 'messageThreadTarget' | 'calendarEventTarget',
  ): Promise<Target[]> => {
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
        gqlFields:
          'id targetCompanyId targetPersonId isAutomaticallyAssigned isManuallyAssigned',
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const targets: Target[] = response.body.data[`${objectName}s`].edges.map(
      ({ node }: { node: Target }) => node,
    );

    for (const target of targets) {
      if (!fixtures.some(({ id }) => id === target.id)) {
        fixtures.push({ objectName, id: target.id });
      }
    }

    return targets;
  };

  beforeEach(async () => {
    companyId = await create('company', {
      name: 'Initial attribution company',
    });
    otherCompanyId = await create('company', {
      name: 'Manual attribution company',
    });
    // Imported participants can have identities without email handles.
    personId = await create('person', {
      name: { firstName: 'Imported contact' },
    });
    messageThreadId = await create('messageThread', {});
    const messageId = await create('message', {
      messageThreadId,
      subject: 'Initial company attribution',
      receivedAt: '2026-01-01T12:00:00.000Z',
    });

    await create('messageParticipant', {
      messageId,
      personId,
      handle: 'urn:contact:imported',
      role: 'FROM',
    });
    calendarEventId = await create('calendarEvent', {
      title: 'Initial company attribution',
      startsAt: '2026-01-01T12:00:00.000Z',
      endsAt: '2026-01-01T13:00:00.000Z',
    });
    await create('calendarEventParticipant', {
      calendarEventId,
      personId,
      handle: 'urn:contact:imported',
    });
    await create('messageThreadTarget', {
      messageThreadId,
      targetPersonId: personId,
      isAutomaticallyAssigned: true,
      isManuallyAssigned: false,
    });
    await create('calendarEventTarget', {
      calendarEventId,
      targetPersonId: personId,
      isAutomaticallyAssigned: true,
      isManuallyAssigned: false,
    });
    await waitForAllJobsToFinish();
  });

  afterEach(async () => {
    await findTargets('messageThreadTarget');
    await findTargets('calendarEventTarget');

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

  it('links existing emails and events when the first company is assigned, without rematching participants', async () => {
    await updateCompany(companyId);

    for (const objectName of [
      'messageThreadTarget',
      'calendarEventTarget',
    ] as const) {
      const targets = await findTargets(objectName);

      expect(targets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            targetCompanyId: companyId,
            isAutomaticallyAssigned: true,
            isManuallyAssigned: false,
          }),
          expect.objectContaining({ targetPersonId: personId }),
        ]),
      );
      expect(
        targets.filter((target) => target.targetCompanyId === companyId),
      ).toHaveLength(1);
    }
  });

  it('preserves manual attribution and does not recreate explicitly removed company targets', async () => {
    for (const objectName of [
      'messageThreadTarget',
      'calendarEventTarget',
    ] as const) {
      const parent =
        objectName === 'messageThreadTarget'
          ? { messageThreadId }
          : { calendarEventId };

      await create(objectName, {
        ...parent,
        targetCompanyId: otherCompanyId,
        isManuallyAssigned: true,
        isAutomaticallyAssigned: false,
      });
      const removedTargetId = await create(objectName, {
        ...parent,
        targetCompanyId: companyId,
        isManuallyAssigned: true,
        isAutomaticallyAssigned: false,
      });
      const response = await makeGraphqlApiRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: objectName,
          recordId: removedTargetId,
          gqlFields: 'id',
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await updateCompany(companyId);

    for (const objectName of [
      'messageThreadTarget',
      'calendarEventTarget',
    ] as const) {
      const targets = await findTargets(objectName);

      expect(targets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            targetCompanyId: otherCompanyId,
            isManuallyAssigned: true,
          }),
          expect.objectContaining({ targetPersonId: personId }),
        ]),
      );
      expect(
        targets.some((target) => target.targetCompanyId === companyId),
      ).toBe(false);
    }
  });

  it('does not move the existing company attribution on a later company reassignment', async () => {
    await updateCompany(companyId);
    await updateCompany(otherCompanyId);

    for (const objectName of [
      'messageThreadTarget',
      'calendarEventTarget',
    ] as const) {
      const targets = await findTargets(objectName);

      expect(
        targets.some((target) => target.targetCompanyId === companyId),
      ).toBe(true);
      expect(
        targets.some((target) => target.targetCompanyId === otherCompanyId),
      ).toBe(false);
    }
  });

  it('reconciles activity beyond the first page of matched participants', async () => {
    const secondThreadId = await create('messageThread', {});
    const secondMessageId = await create('message', {
      messageThreadId: secondThreadId,
      receivedAt: '2026-01-02T12:00:00.000Z',
    });
    const secondEventId = await create('calendarEvent', {
      title: 'Activity beyond the first page',
      startsAt: '2026-01-02T12:00:00.000Z',
      endsAt: '2026-01-02T13:00:00.000Z',
    });
    const firstMessage = fixtures.find(
      ({ objectName }) => objectName === 'message',
    );

    expect(firstMessage).toBeDefined();

    for (const objectName of [
      'messageParticipant',
      'calendarEventParticipant',
    ] as const) {
      const parent =
        objectName === 'messageParticipant'
          ? { messageId: firstMessage!.id, role: 'FROM' }
          : { calendarEventId };

      // Keep each API mutation within the test server's 100-record write limit.
      for (let offset = 0; offset < QUERY_MAX_RECORDS; offset += 100) {
        const data = Array.from(
          { length: Math.min(100, QUERY_MAX_RECORDS - offset) },
          (_, index) => ({
            id: randomUUID(),
            ...parent,
            personId,
            handle: `urn:contact:page:${offset + index}`,
          }),
        );
        const response = await makeGraphqlApiRequest(
          createManyOperationFactory({
            objectMetadataSingularName: objectName,
            objectMetadataPluralName: `${objectName}s`,
            gqlFields: 'id',
            data,
          }),
        );

        expect(response.body.errors).toBeUndefined();
        fixtures.push(...data.map(({ id }) => ({ objectName, id })));
      }

      const lastParticipantId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
      const response = await createOneOperation({
        objectMetadataSingularName: objectName,
        input: {
          id: lastParticipantId,
          personId,
          handle: 'urn:contact:last-page',
          ...(objectName === 'messageParticipant'
            ? { messageId: secondMessageId, role: 'FROM' }
            : { calendarEventId: secondEventId }),
        },
      });

      expect(response.errors).toBeUndefined();
      fixtures.push({ objectName, id: lastParticipantId });
    }

    await updateCompany(companyId);
    await findTargets('messageThreadTarget');
    await findTargets('calendarEventTarget');
    messageThreadId = secondThreadId;
    calendarEventId = secondEventId;

    for (const objectName of [
      'messageThreadTarget',
      'calendarEventTarget',
    ] as const) {
      expect(await findTargets(objectName)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            targetCompanyId: companyId,
            isAutomaticallyAssigned: true,
          }),
        ]),
      );
    }
  });
});
