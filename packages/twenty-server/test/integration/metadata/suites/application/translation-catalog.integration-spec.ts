import { getRepositoryToken } from '@nestjs/typeorm';
import gql from 'graphql-tag';
import { type Repository } from 'typeorm';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationNotificationService } from 'src/engine/core-modules/application/application-translation/application-translation-notification.service';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const CONSTRAINT_NAME = `translation_test_${TEST_APP_ID.replace(/-/g, '')}`;
const queryCatalog = (applicationId: string, locale = 'fr-FR') =>
  makeMetadataApiRequest({
    query: gql`
      query Catalog($applicationId: UUID!, $locale: String!) {
        applicationTranslationCatalog(
          applicationId: $applicationId
          locale: $locale
        )
      }
    `,
    variables: { applicationId, locale },
  });

describe('Application translation catalog', () => {
  let application: ApplicationEntity;
  let applicationRegistrationId: string;
  let translationRepository: Repository<ApplicationTranslationEntity>;
  let cache: ApplicationTranslationCacheService;
  let otherProcessCache: ApplicationTranslationCacheService;
  let sync: ApplicationTranslationSyncService;
  let broadcaster: WorkspaceEventBroadcaster;

  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Runtime Translation Test',
      description: 'Catalog cache and delivery',
      sourcePath: 'runtime-translation-test',
    });
    await syncApplication({
      manifest: buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID }),
    });
    jest.useRealTimers();
    const applicationRepository = app.get<Repository<ApplicationEntity>>(
      getRepositoryToken(ApplicationEntity),
    );
    application = await applicationRepository.findOneByOrFail({
      universalIdentifier: TEST_APP_ID,
    });
    jestExpectToBeDefined(application.applicationRegistrationId);
    applicationRegistrationId = application.applicationRegistrationId;
    translationRepository =
      applicationRepository.manager.connection.getRepository<ApplicationTranslationEntity>(
        'ApplicationTranslationEntity',
      );
    broadcaster = getAppProviderByClassName<WorkspaceEventBroadcaster>(
      'WorkspaceEventBroadcaster',
    );
    const createCache = () =>
      new ApplicationTranslationCacheService(
        translationRepository,
        app.get(CacheStorageNamespace.ModuleApplications),
      );
    cache = createCache();
    sync = getAppProviderByClassName<ApplicationTranslationSyncService>(
      'ApplicationTranslationSyncService',
    );
    otherProcessCache = createCache();
  }, 60000);

  afterEach(async () => {
    jest.restoreAllMocks();
    await testDataSource.query(
      `ALTER TABLE core."applicationTranslation" DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  const input = () => ({ applicationRegistrationId, locale: 'fr-FR' as const });

  it('shares catalog reads across service instances and invalidates warm local caches after apply', async () => {
    await sync.syncFromManifest({
      ...input(),
      translations: { 'fr-FR': { greeting: 'Bonjour' } },
    });
    const find = jest.spyOn(translationRepository, 'find');
    expect(await cache.getCurrentCatalog(input())).toEqual({
      greeting: 'Bonjour',
    });
    expect(await otherProcessCache.getCurrentCatalog(input())).toEqual({
      greeting: 'Bonjour',
    });
    expect(find).toHaveBeenCalledTimes(1);

    await sync.syncFromManifest({
      ...input(),
      translations: { 'fr-FR': { greeting: 'Salut' } },
    });
    find.mockClear();
    const catalogs = await Promise.all(
      Array.from({ length: 100 }, () =>
        otherProcessCache.getCurrentCatalog(input()),
      ),
    );
    expect(catalogs.every((catalog) => catalog.greeting === 'Salut')).toBe(
      true,
    );
    expect(await cache.getCurrentCatalog(input())).toEqual({
      greeting: 'Salut',
    });
    expect(find).toHaveBeenCalledTimes(1);

    const response = await queryCatalog(application.id);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.applicationTranslationCatalog).toEqual({
      greeting: 'Salut',
    });
    expect(
      (await queryCatalog(application.id, 'en')).body.data
        .applicationTranslationCatalog,
    ).toEqual({});
    expect(
      (await queryCatalog(uuidv4())).body.data.applicationTranslationCatalog,
    ).toEqual({});
    const [otherWorkspace] = await testDataSource.query<{ id: string }[]>(
      'SELECT id FROM core.workspace WHERE id <> $1 LIMIT 1',
      [application.workspaceId],
    );
    jestExpectToBeDefined(otherWorkspace);
    const foreignApplication = await app
      .get<Repository<ApplicationEntity>>(getRepositoryToken(ApplicationEntity))
      .save({
        ...application,
        id: uuidv4(),
        workspaceId: otherWorkspace.id,
      });
    expect(
      (await queryCatalog(foreignApplication.id)).body.data
        .applicationTranslationCatalog,
    ).toEqual({});
    expect(
      (await queryCatalog(application.id, 'invalid')).body.errors,
    ).toBeDefined();

    await sync.syncFromManifest({ ...input(), translations: {} });
    expect(await otherProcessCache.getCurrentCatalog(input())).toEqual({});
  }, 60000);

  it('keeps an in-flight read from repopulating the current generation after apply', async () => {
    await sync.syncFromManifest({
      ...input(),
      translations: { 'fr-FR': { greeting: 'Older' } },
    });
    const originalFind = translationRepository.find.bind(translationRepository);
    let releaseRead: () => void = () => undefined;
    let signalReadStarted: () => void = () => undefined;
    const readStarted = new Promise<void>((resolve) => {
      signalReadStarted = resolve;
    });
    const readReleased = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    jest
      .spyOn(translationRepository, 'find')
      .mockImplementationOnce(async (options) => {
        const rows = await originalFind(options);
        signalReadStarted();
        await readReleased;
        return rows;
      });
    const pendingCatalog = otherProcessCache.getCurrentCatalog(input());
    await readStarted;
    try {
      await sync.syncFromManifest({
        ...input(),
        translations: { 'fr-FR': { greeting: 'Current' } },
      });
      expect(await cache.getCurrentCatalog(input())).toEqual({
        greeting: 'Current',
      });
    } finally {
      releaseRead();
    }
    expect(await pendingCatalog).toEqual({ greeting: 'Older' });
    expect(await otherProcessCache.getCurrentCatalog(input())).toEqual({
      greeting: 'Current',
    });
  }, 60000);

  it('broadcasts only committed changes after invalidation and never broadcasts rolled-back changes', async () => {
    await cache.getCurrentCatalog(input());
    await otherProcessCache.getCurrentCatalog(input());
    const broadcast = jest.spyOn(broadcaster, 'broadcast');
    const notificationService =
      getAppProviderByClassName<ApplicationTranslationNotificationService>(
        'ApplicationTranslationNotificationService',
      );
    const originalNotify =
      notificationService.notifyCatalogUpdated.bind(notificationService);
    const catalogsAtNotification: Record<string, string>[] = [];
    const notification = jest
      .spyOn(notificationService, 'notifyCatalogUpdated')
      .mockImplementation(async (registrationId) => {
        catalogsAtNotification.push(
          await otherProcessCache.getCurrentCatalog(input()),
        );
        await originalNotify(registrationId);
      });
    await sync.syncFromManifest({
      ...input(),
      translations: { 'fr-FR': { greeting: 'Bonjour' } },
    });
    expect(notification).toHaveBeenCalledWith(
      application.applicationRegistrationId,
    );
    await notification.mock.results[0].value;
    expect(catalogsAtNotification).toEqual([{ greeting: 'Bonjour' }]);
    expect(broadcast).toHaveBeenCalledWith({
      workspaceId: application.workspaceId,
      events: [
        {
          type: 'updated',
          entityName: 'application',
          recordId: application.id,
          properties: {
            updatedFields: ['translationCatalog'],
            after: { id: application.id, translationCatalogUpdated: true },
          },
        },
      ],
    });
    expect(await otherProcessCache.getCurrentCatalog(input())).toEqual({
      greeting: 'Bonjour',
    });
    expect(
      await translationRepository.findOneByOrFail({
        applicationRegistrationId,
        locale: 'fr-FR',
      }),
    ).toMatchObject({ messages: { greeting: 'Bonjour' } });

    notification.mockClear();
    broadcast.mockClear();
    await testDataSource.query(`ALTER TABLE core."applicationTranslation" ADD CONSTRAINT "${CONSTRAINT_NAME}"
      CHECK ("applicationRegistrationId" <> '${application.applicationRegistrationId}' OR "deletedAt" IS NULL)`);
    await expect(
      sync.syncFromManifest({ ...input(), translations: {} }),
    ).rejects.toThrow(CONSTRAINT_NAME);
    expect(notification).not.toHaveBeenCalled();
    expect(broadcast).not.toHaveBeenCalled();
    expect(await otherProcessCache.getCurrentCatalog(input())).toEqual({
      greeting: 'Bonjour',
    });
  }, 60000);
});
