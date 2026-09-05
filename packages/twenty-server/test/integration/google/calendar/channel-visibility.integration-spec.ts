import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordIdsByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'google-calendar-visibility@apple.dev';
const ATTENDEE_HANDLE = 'google-calendar-visibility-attendee@acme.com';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

type MakeRequest =
  | typeof makeGraphqlAPIRequest
  | typeof makeGraphqlAPIRequestWithMemberRole;

const GET_TIMELINE_CALENDAR_EVENTS_FROM_PERSON_ID = gql`
  query GetTimelineCalendarEventsFromPersonId(
    $personId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromPersonId(
      personId: $personId
      page: $page
      pageSize: $pageSize
    ) {
      totalNumberOfCalendarEvents
      timelineCalendarEvents {
        id
        title
      }
    }
  }
`;

describe('Calendar channel visibility (integration)', () => {
  const eventTitle = `Calendar event ${randomUUID()}`;
  const ownerOnlySourceId = randomUUID();

  const gmail = setupGoogleMock({ handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let calendarEventId: string;
  let attendeePersonId: string;
  let recordShareService: RecordShareService;
  let calendarEventObjectMetadataId: string;

  const calendarEventQuery = () =>
    findManyOperationFactory({
      objectMetadataSingularName: 'calendarEvent',
      objectMetadataPluralName: 'calendarEvents',
      gqlFields: 'id title description',
      filter: { title: { eq: eventTitle } },
    });

  const readEventsAs = async (makeRequest: MakeRequest) => {
    const response = await makeRequest(calendarEventQuery());

    expect(response.body.errors).toBeUndefined();

    return response.body.data.calendarEvents.edges.map(
      (edge: { node: { id: string; title: string; description: string } }) =>
        edge.node,
    );
  };

  const updateEventLocationAs = async (
    makeRequest: MakeRequest,
    location: string,
  ) => {
    const response = await makeRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: 'id',
        data: { location },
        filter: { id: { eq: calendarEventId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.updateCalendarEvents.map(
      (calendarEvent: { id: string }) => calendarEvent.id,
    );
  };

  const readTimelineAs = async (makeRequest: MakeRequest) => {
    const response = await makeRequest({
      query: GET_TIMELINE_CALENDAR_EVENTS_FROM_PERSON_ID,
      variables: { personId: attendeePersonId, page: 1, pageSize: 10 },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.getTimelineCalendarEventsFromPersonId as {
      totalNumberOfCalendarEvents: number;
      timelineCalendarEvents: { id: string; title: string }[];
    };
  };

  const setVisibility = async (visibility: CalendarChannelVisibility) => {
    await getCoreRepository<CalendarChannelEntity>(
      CalendarChannelEntity,
    ).update({ id: channel.calendarChannelId }, { visibility });
  };

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const calendarEventObjectMetadata =
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'calendarEvent',
        },
      });

    calendarEventObjectMetadataId = calendarEventObjectMetadata.id;

    const createPersonResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: ATTENDEE_HANDLE } },
      }),
    );

    expect(createPersonResponse.body.errors).toBeUndefined();
    attendeePersonId = createPersonResponse.body.data.createPerson.id;

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    gmail.serveCalendarEvents([
      googleCalendarEvent({
        summary: eventTitle,
        description: 'Agenda for the meeting',
        attendees: [{ email: ATTENDEE_HANDLE }],
      }),
    ]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);
    await waitForAllJobsToFinish();

    [calendarEventId] = await findRecordIdsByFilter(
      'calendarEvent',
      'calendarEvents',
      { title: { eq: eventTitle } },
    );
  }, 120000);

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await recordShareService
      .deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId: ownerOnlySourceId,
      })
      .catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: attendeePersonId,
      }),
    ).catch(() => undefined);
  });

  it('shows the full event to another member when the channel shares everything', async () => {
    await setVisibility(CalendarChannelVisibility.SHARE_EVERYTHING);

    const [event] = await readEventsAs(makeGraphqlAPIRequestWithMemberRole);

    expect(event.title).toBe(eventTitle);
    expect(event.description).not.toBe(RESTRICTED);
  }, 60000);

  it('masks the title and description for another member under metadata visibility', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const [event] = await readEventsAs(makeGraphqlAPIRequestWithMemberRole);

    expect(event.title).toBe(RESTRICTED);
    expect(event.description).toBe(RESTRICTED);
  }, 60000);

  it('always shows the full event to the owner of the connected account', async () => {
    await setVisibility(CalendarChannelVisibility.METADATA);

    const [event] = await readEventsAs(makeGraphqlAPIRequest);

    expect(event.title).toBe(eventTitle);
    expect(event.description).not.toBe(RESTRICTED);
  }, 60000);

  describe('with record sharing enabled', () => {
    beforeAll(async () => {
      await setVisibility(CalendarChannelVisibility.METADATA);
      await setRecordSharingEnabled(true);
    });

    afterAll(async () => {
      await setRecordSharingEnabled(false);
    });

    it('shows the masked event to another member through the everyone READ row', async () => {
      const events = await readEventsAs(makeGraphqlAPIRequestWithMemberRole);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe(RESTRICTED);
      expect(events[0].description).toBe(RESTRICTED);
    }, 60000);

    it('lets the owner update the event but not another member', async () => {
      expect(
        await updateEventLocationAs(
          makeGraphqlAPIRequestWithMemberRole,
          'Member room',
        ),
      ).toEqual([]);
      expect(
        await updateEventLocationAs(makeGraphqlAPIRequest, 'Owner room'),
      ).toEqual([calendarEventId]);
    }, 60000);

    it('gates the person timeline of another member on the everyone READ row', async () => {
      const memberTimeline = await readTimelineAs(
        makeGraphqlAPIRequestWithMemberRole,
      );

      expect(memberTimeline.totalNumberOfCalendarEvents).toBe(1);
      expect(memberTimeline.timelineCalendarEvents).toEqual([
        expect.objectContaining({ id: calendarEventId, title: RESTRICTED }),
      ]);

      const ownerTimeline = await readTimelineAs(makeGraphqlAPIRequest);

      expect(ownerTimeline.totalNumberOfCalendarEvents).toBe(1);
      expect(ownerTimeline.timelineCalendarEvents[0].title).toBe(eventTitle);
    }, 60000);

    it('hides the event from another member once the channel rows are gone while an owner FULL row keeps it for the owner', async () => {
      await recordShareService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId: channel.calendarChannelId,
      });
      await recordShareService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: calendarEventId,
            objectMetadataId: calendarEventObjectMetadataId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.APPLICATION,
            sourceId: ownerOnlySourceId,
          },
        ],
      });

      expect(await readEventsAs(makeGraphqlAPIRequestWithMemberRole)).toEqual(
        [],
      );
      expect(
        (await readTimelineAs(makeGraphqlAPIRequestWithMemberRole))
          .totalNumberOfCalendarEvents,
      ).toBe(0);

      const [ownerEvent] = await readEventsAs(makeGraphqlAPIRequest);

      expect(ownerEvent.title).toBe(eventTitle);
      expect(
        (await readTimelineAs(makeGraphqlAPIRequest))
          .totalNumberOfCalendarEvents,
      ).toBe(1);
    }, 60000);
  });
});
