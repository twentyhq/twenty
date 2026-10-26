import { faker } from '@faker-js/faker';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ViewType } from 'twenty-shared/types';

import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';

const OBJECT_NAME = 'viewDeletionEventTest';

describe('Object deletion view events', () => {
  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;

  beforeAll(() => {
    publisher = getAppProviderByClassName('MetadataEventPublisher');
    emitter = getAppProviderByClassName('MetadataEventEmitter');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('publishes a delete event for every view of the deleted object', async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: `${OBJECT_NAME}s`,
        labelSingular: 'View deletion event test',
        labelPlural: 'View deletion event tests',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    const {
      data: { createView: userView },
    } = await createOneView({
      expectToFail: false,
      gqlFields: 'id',
      input: {
        id: faker.string.uuid(),
        icon: 'IconTable',
        name: 'User table view',
        objectMetadataId: createOneObject.id,
        type: ViewType.TABLE,
      },
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createOneObject.id,
        updatePayload: { isActive: false },
      },
    });
    await emitter.drain();

    const publishedBatches: MetadataEventBatch[] = [];
    const publish = publisher.publish.bind(publisher);

    jest.spyOn(publisher, 'publish').mockImplementation(async (batch) => {
      publishedBatches.push(batch);
      await publish(batch);
    });

    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createOneObject.id },
    });
    await emitter.drain();

    const deletedViewIds = publishedBatches
      .filter(
        (batch) => batch.metadataName === 'view' && batch.type === 'deleted',
      )
      .flatMap((batch) => batch.events.map((event) => event.recordId));

    expect(deletedViewIds).toContain(userView.id);
  });
});
