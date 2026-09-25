import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';

const OBJECT_NAME = 'metadataNotificationTest';

describe('Metadata event draining before command shutdown', () => {
  let objectMetadataId: string;
  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;

  beforeAll(async () => {
    publisher = getAppProviderByClassName('MetadataEventPublisher');
    emitter = getAppProviderByClassName('MetadataEventEmitter');

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: `${OBJECT_NAME}s`,
        labelSingular: 'Metadata notification test',
        labelPlural: 'Metadata notification tests',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
    await emitter.drain();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await emitter.drain();
  });

  afterAll(async () => {
    if (!isDefined(objectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
    await emitter.drain();
  });

  const blockObjectUpdatedPublish = () => {
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    const publish = publisher.publish.bind(publisher);

    jest.spyOn(publisher, 'publish').mockImplementation(async (batch) => {
      if (batch.metadataName === 'objectMetadata' && batch.type === 'updated') {
        await blocked;
      }

      await publish(batch);
    });

    return release;
  };

  const updateDescription = (description: string) =>
    updateOneObjectMetadata({
      expectToFail: false,
      gqlFields: 'id description',
      input: { idToUpdate: objectMetadataId, updatePayload: { description } },
    });

  it('returns the mutation without waiting and drains the notification on shutdown', async () => {
    const release = blockObjectUpdatedPublish();

    const { data } = await updateDescription('Pending notification');

    expect(data.updateOneObject.description).toBe('Pending notification');

    let drained = false;
    const draining = emitter.drain().then(() => {
      drained = true;
    });

    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(drained).toBe(false);

    release();
    await draining;

    expect(drained).toBe(true);
  });

  it('stops waiting for a stalled notification after the timeout', async () => {
    const release = blockObjectUpdatedPublish();

    await updateDescription('Stalled notification');

    await expect(emitter.drain(10)).resolves.toBeUndefined();

    release();
  });
});
