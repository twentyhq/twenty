import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
import { type MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OBJECT_NAME = 'metadataNotificationTest';

describe('Metadata event completion before command shutdown', () => {
  let objectMetadataId: string;
  let workspaceCacheService: WorkspaceCacheService;
  let migrations: WorkspaceMigrationValidateBuildAndRunService;
  let publisher: MetadataEventPublisher;
  let emitter: MetadataEventEmitter;

  beforeAll(async () => {
    workspaceCacheService = getAppProviderByClassName('WorkspaceCacheService');
    migrations = getAppProviderByClassName(
      'WorkspaceMigrationValidateBuildAndRunService',
    );
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
    await emitter.drain();
    jest.restoreAllMocks();
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

  const migrate = async (description: string, dryRun = false) => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const objectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((object) => object?.id === objectMetadataId);
    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.objectMetadataId === objectMetadataId && field.name === 'name',
    );

    if (!isDefined(objectMetadata) || !isDefined(fieldMetadata)) {
      throw new Error('Test object metadata was not created');
    }

    return migrations.validateBuildAndRunWorkspaceMigration({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier:
        objectMetadata.applicationUniversalIdentifier,
      dryRun,
      allFlatEntityOperationByMetadataName: {
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [{ ...objectMetadata, description }],
        },
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [{ ...fieldMetadata, description }],
        },
      },
    });
  };

  const readObject = () =>
    getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneByOrFail({ id: objectMetadataId });

  it.each(['objectMetadata', 'fieldMetadata'])(
    'returns the mutation immediately but drains the pending %s notification before shutdown',
    async (metadataName) => {
      let release!: () => void;
      const blocked = new Promise<void>((resolve) => {
        release = resolve;
      });
      let notifyStarted!: () => void;
      const started = new Promise<void>((resolve) => {
        notifyStarted = resolve;
      });
      const publish = publisher.publish.bind(publisher);
      const completedBatches: string[] = [];

      jest.spyOn(publisher, 'publish').mockImplementation(async (batch) => {
        if (batch.type !== 'updated') {
          return publish(batch);
        }

        if (batch.metadataName === metadataName) {
          notifyStarted();
          await blocked;
        }
        await publish(batch);
        completedBatches.push(batch.metadataName);
      });

      let migrationCompleted = false;
      let commandCompleted = false;
      const description = `Wait for ${metadataName}`;
      const migration = migrate(description).then((result) => {
        migrationCompleted = true;
        return result;
      });

      const command = migration.then(async () => {
        await emitter.drain();
        commandCompleted = true;
      });

      try {
        await Promise.race([started, command]);
        // Only shutdown should wait for notification delivery, not the mutation.
        expect((await readObject()).description).toBe(description);
        expect(migrationCompleted).toBe(true);
        expect(commandCompleted).toBe(false);
      } finally {
        release();
        await command;
      }

      expect(await migration).toMatchObject({ status: 'success' });
      expect(commandCompleted).toBe(true);
      expect(completedBatches).toEqual(
        expect.arrayContaining(['objectMetadata', 'fieldMetadata']),
      );
    },
  );

  it('also drains notifications emitted after draining has started', async () => {
    let releaseFirst!: () => void;
    const firstBlocked = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let releaseSecond!: () => void;
    const secondBlocked = new Promise<void>((resolve) => {
      releaseSecond = resolve;
    });
    let notifyFirstCompleted!: () => void;
    const firstCompleted = new Promise<void>((resolve) => {
      notifyFirstCompleted = resolve;
    });
    const publish = publisher.publish.bind(publisher);
    let objectBatchCount = 0;

    jest.spyOn(publisher, 'publish').mockImplementation(async (batch) => {
      if (batch.type !== 'updated' || batch.metadataName !== 'objectMetadata') {
        return publish(batch);
      }

      const isFirstBatch = objectBatchCount++ === 0;

      await (isFirstBatch ? firstBlocked : secondBlocked);
      await publish(batch);
      if (isFirstBatch) {
        notifyFirstCompleted();
      }
    });

    let drained = false;
    let draining: Promise<void> | undefined;

    try {
      await expect(
        migrate('First pending notification'),
      ).resolves.toMatchObject({ status: 'success' });
      draining = emitter.drain().then(() => {
        drained = true;
      });
      await expect(
        migrate('Second pending notification'),
      ).resolves.toMatchObject({ status: 'success' });
      releaseFirst();
      await firstCompleted;
      // Let the first drain snapshot settle while the second notification is blocked.
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(drained).toBe(false);
    } finally {
      releaseFirst();
      releaseSecond();
      await draining;
      await emitter.drain();
    }

    expect(drained).toBe(true);
    expect((await readObject()).description).toBe(
      'Second pending notification',
    );
  });

  it('preserves committed metadata when notification delivery fails', async () => {
    jest
      .spyOn(publisher, 'publish')
      .mockRejectedValueOnce(new Error('Notification delivery failed'));

    await expect(
      migrate('Committed despite notification failure'),
    ).resolves.toMatchObject({ status: 'success' });
    await expect(emitter.drain()).resolves.toBeUndefined();
    expect((await readObject()).description).toBe(
      'Committed despite notification failure',
    );
  });

  it('does not write metadata or publish notifications during a dry run', async () => {
    const before = await readObject();
    const publish = jest.spyOn(publisher, 'publish');

    await expect(migrate('Dry run', true)).resolves.toMatchObject({
      status: 'success',
    });

    expect((await readObject()).description).toBe(before.description);
    expect(publish).not.toHaveBeenCalled();
  });
});
