import { randomUUID } from 'node:crypto';

import { isDefined } from 'twenty-shared/utils';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type DatabaseEventTriggerConditionService } from 'src/engine/workspace-event-emitter/services/database-event-trigger-condition.service';

const BIG_COMPANY_ID = randomUUID();
const SMALL_COMPANY_ID = randomUUID();

const buildOpportunityCreatedEvent = (
  companyId: string | null,
): ObjectRecordEvent => ({
  recordId: randomUUID(),
  properties: { after: { stage: 'NEW', companyId } },
});

describe('Database event trigger conditions on related records', () => {
  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          {
            id: BIG_COMPANY_ID,
            name: 'Big Co',
            employees: 500,
            address: { addressCity: 'Paris' },
          },
          { id: SMALL_COMPANY_ID, name: 'Small Co', employees: 5 },
        ],
      }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: [BIG_COMPANY_ID, SMALL_COMPANY_ID] } },
      }),
    );
  });

  const filterOpportunityEvents = async ({
    condition,
    events,
  }: {
    condition: string;
    events: ObjectRecordEvent[];
  }) => {
    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
    const { flatApplicationMaps, flatObjectMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatApplicationMaps',
        'flatObjectMetadataMaps',
      ]);
    const application = Object.values(flatApplicationMaps.byId).find(
      (candidate) => isDefined(candidate?.defaultRoleId),
    );
    const objectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((candidate) => candidate?.nameSingular === 'opportunity');

    if (!isDefined(application) || !isDefined(objectMetadata)) {
      throw new Error('The seeded workspace has no application or opportunity');
    }

    return getAppProviderByClassName<DatabaseEventTriggerConditionService>(
      'DatabaseEventTriggerConditionService',
    ).filterMatchingEvents({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadata,
      events,
      eventName: 'opportunity.created',
      condition,
      application,
    });
  };

  it('matches on a field of the related record', async () => {
    const bigCompanyEvent = buildOpportunityCreatedEvent(BIG_COMPANY_ID);
    const smallCompanyEvent = buildOpportunityCreatedEvent(SMALL_COMPANY_ID);
    const noCompanyEvent = buildOpportunityCreatedEvent(null);

    const { events, conditionErrorMessage } = await filterOpportunityEvents({
      condition: 'company.employees > 100',
      events: [bigCompanyEvent, smallCompanyEvent, noCompanyEvent],
    });

    expect(conditionErrorMessage).toBeUndefined();
    expect(events).toEqual([bigCompanyEvent]);
  });

  it('matches on a subfield of a composite field of the related record', async () => {
    const bigCompanyEvent = buildOpportunityCreatedEvent(BIG_COMPANY_ID);
    const smallCompanyEvent = buildOpportunityCreatedEvent(SMALL_COMPANY_ID);

    const { events, conditionErrorMessage } = await filterOpportunityEvents({
      condition: "company.address.addressCity == 'Paris'",
      events: [bigCompanyEvent, smallCompanyEvent],
    });

    expect(conditionErrorMessage).toBeUndefined();
    expect(events).toEqual([bigCompanyEvent]);
  });

  it('matches on the related record id without loading it', async () => {
    const bigCompanyEvent = buildOpportunityCreatedEvent(BIG_COMPANY_ID);
    const noCompanyEvent = buildOpportunityCreatedEvent(null);

    const { events } = await filterOpportunityEvents({
      condition: `company.id == '${BIG_COMPANY_ID}'`,
      events: [bigCompanyEvent, noCompanyEvent],
    });

    expect(events).toEqual([bigCompanyEvent]);
  });

  it('reads a related record that does not exist as empty', async () => {
    const missingCompanyEvent = buildOpportunityCreatedEvent(randomUUID());

    const { events } = await filterOpportunityEvents({
      condition: 'not isDefined(company.employees)',
      events: [missingCompanyEvent],
    });

    expect(events).toEqual([missingCompanyEvent]);
  });
});
