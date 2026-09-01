import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const APPLICATION_PAYLOAD_KEYS = [
  'applicationRegistrationId',
  'description',
  'id',
  'name',
  'sdkClientCoreChecksum',
  'state',
  'universalIdentifier',
  'version',
];

const APPLICATION_REGISTRATION_PAYLOAD_KEYS = [
  'id',
  'isListed',
  'isVetted',
  'latestAvailableVersion',
  'name',
  'ownerWorkspaceId',
  'sourceType',
  'universalIdentifier',
];

describe('Application broadcast events', () => {
  let appId: string;
  let roleId: string;
  let broadcastSpy: jest.SpyInstance;

  const eventsFor = (
    entityName: string,
    type: WorkspaceBroadcastEvent['type'],
  ): WorkspaceBroadcastEvent[] =>
    broadcastSpy.mock.calls
      .flatMap(([{ events }]) => events)
      .filter(
        (event) => event.entityName === entityName && event.type === type,
      );

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();

    const workspaceEventBroadcaster =
      getAppProviderByClassName<WorkspaceEventBroadcaster>(
        'WorkspaceEventBroadcaster',
      );

    broadcastSpy = jest
      .spyOn(workspaceEventBroadcaster, 'broadcast')
      .mockResolvedValue(undefined);

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Broadcast test application',
      description: 'App for testing lifecycle broadcasts',
      sourcePath: 'test-broadcast-events',
    });
  }, 60000);

  afterEach(async () => {
    broadcastSpy.mockRestore();

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('broadcasts the registration and application rows through their lifecycle', async () => {
    const registrationCreatedEvent = eventsFor(
      'applicationRegistration',
      'created',
    ).find(
      (event) =>
        (event.properties.after as { universalIdentifier?: string })
          ?.universalIdentifier === appId,
    );

    expect(registrationCreatedEvent).toBeDefined();
    expect(
      Object.keys(registrationCreatedEvent?.properties.after ?? {}).sort(),
    ).toEqual(APPLICATION_REGISTRATION_PAYLOAD_KEYS);
    expect(registrationCreatedEvent?.properties.after).toMatchObject({
      name: 'Broadcast test application',
    });

    const applicationCreatedEvent = eventsFor('application', 'created').find(
      (event) =>
        (event.properties.after as { universalIdentifier?: string })
          ?.universalIdentifier === appId,
    );

    expect(applicationCreatedEvent).toBeDefined();
    expect(
      Object.keys(applicationCreatedEvent?.properties.after ?? {}).sort(),
    ).toEqual(APPLICATION_PAYLOAD_KEYS);
    expect(applicationCreatedEvent?.properties.after).toMatchObject({
      id: applicationCreatedEvent?.recordId,
      name: 'Broadcast test application',
      state: expect.any(String),
    });

    const applicationRegistrationId = registrationCreatedEvent?.recordId;

    broadcastSpy.mockClear();

    const updateRegistrationResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation UpdateApplicationRegistration(
          $input: UpdateApplicationRegistrationInput!
        ) {
          updateApplicationRegistration(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          id: applicationRegistrationId,
          update: { name: 'Broadcast test application renamed' },
        },
      },
    });

    expect(updateRegistrationResponse.body.errors).toBeUndefined();

    const registrationUpdatedEvents = eventsFor(
      'applicationRegistration',
      'updated',
    ).filter((event) => event.recordId === applicationRegistrationId);

    expect(registrationUpdatedEvents).toHaveLength(1);
    expect(
      Object.keys(registrationUpdatedEvents[0].properties.after ?? {}).sort(),
    ).toEqual(APPLICATION_REGISTRATION_PAYLOAD_KEYS);
    expect(registrationUpdatedEvents[0].properties.after).toMatchObject({
      name: 'Broadcast test application renamed',
    });

    broadcastSpy.mockClear();

    await syncApplication({
      manifest: buildBaseManifest({ appId, roleId }),
      expectToFail: false,
    });

    const applicationUpdatedEvents = eventsFor('application', 'updated');

    expect(
      applicationUpdatedEvents.some(
        (event) =>
          (event.properties.after as { universalIdentifier?: string })
            ?.universalIdentifier === appId,
      ),
    ).toBe(true);

    for (const applicationUpdatedEvent of applicationUpdatedEvents) {
      expect(
        Object.keys(applicationUpdatedEvent.properties.after ?? {}).sort(),
      ).toEqual(APPLICATION_PAYLOAD_KEYS);
      expect(applicationUpdatedEvent.properties.updatedFields).toEqual(
        expect.arrayContaining([expect.any(String)]),
      );
      expect(applicationUpdatedEvent.properties.updatedFields).not.toContain(
        'workspaceId',
      );
    }

    broadcastSpy.mockClear();

    await uninstallApplication({
      universalIdentifier: appId,
      expectToFail: false,
    });

    const applicationDeletedEvent = eventsFor('application', 'deleted').find(
      (event) =>
        (event.properties.before as { universalIdentifier?: string })
          ?.universalIdentifier === appId,
    );

    expect(applicationDeletedEvent).toBeDefined();
    expect(
      Object.keys(applicationDeletedEvent?.properties.before ?? {}).sort(),
    ).toEqual(APPLICATION_PAYLOAD_KEYS);
  }, 60000);
});
