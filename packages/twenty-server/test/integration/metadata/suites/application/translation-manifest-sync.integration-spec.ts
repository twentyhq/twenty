import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type TranslationsManifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const CONSTRAINT_NAME = `translation_test_${TEST_APP_ID.replace(/-/g, '')}`;
const buildManifest = (translations?: TranslationsManifest) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { translations },
  });

describe('Manifest translation sync', () => {
  let applicationRegistrationId: string;
  const readRows = () =>
    testDataSource.query<
      {
        id: string;
        locale: string;
        messages: Record<string, string>;
        deletedAt: Date | null;
      }[]
    >(
      'SELECT id, locale, messages, "deletedAt" FROM core."applicationTranslation" WHERE "applicationRegistrationId" = $1 ORDER BY locale',
      [applicationRegistrationId],
    );

  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Translation Sync Test',
      description: 'Translation reporting and persistence',
      sourcePath: 'translation-sync-test',
    });
    const [registration] = await testDataSource.query<{ id: string }[]>(
      'SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1',
      [TEST_APP_ID],
    );
    applicationRegistrationId = registration.id;
  }, 60000);

  afterEach(async () => {
    await testDataSource.query(
      `ALTER TABLE core."applicationTranslation" DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('previews without writes, applies the same changes, prunes and revives locales', async () => {
    const initial = {
      'fr-FR': { greeting: 'Bonjour' },
      'de-DE': { greeting: 'Hallo' },
    };
    const preview = await syncApplication({
      manifest: buildManifest(initial),
      dryRun: true,
    });
    expect(preview.errors).toBeUndefined();
    expect(preview.data.syncApplication.translationActions).toHaveLength(2);
    expect(await readRows()).toEqual([]);

    const applied = await syncApplication({ manifest: buildManifest(initial) });
    expect(applied.errors).toBeUndefined();
    expect(applied.data.syncApplication.translationActions).toEqual(
      preview.data.syncApplication.translationActions,
    );
    const originalRows = await readRows();
    expect(
      originalRows.map(({ locale, messages, deletedAt }) => ({
        locale,
        messages,
        deletedAt,
      })),
    ).toEqual([
      { locale: 'de-DE', messages: initial['de-DE'], deletedAt: null },
      { locale: 'fr-FR', messages: initial['fr-FR'], deletedAt: null },
    ]);

    const translations = {
      'fr-FR': { greeting: 'Salut' },
      'es-ES': { greeting: 'Hola' },
    };
    const updated = await syncApplication({
      manifest: buildManifest(translations),
    });
    expect(updated.errors).toBeUndefined();
    expect(
      updated.data.syncApplication.translationActions?.map(
        ({ type, locale }) => ({ type, locale }),
      ),
    ).toEqual([
      { type: 'delete', locale: 'de-DE' },
      { type: 'create', locale: 'es-ES' },
      { type: 'update', locale: 'fr-FR' },
    ]);
    expect(
      (await readRows()).filter(({ deletedAt }) => deletedAt === null),
    ).toHaveLength(2);

    const unchanged = await syncApplication({
      manifest: buildManifest(translations),
    });
    expect(unchanged.data.syncApplication.translationActions).toEqual([]);
    await syncApplication({ manifest: buildManifest() });
    expect(
      (await readRows()).filter(({ deletedAt }) => deletedAt === null),
    ).toHaveLength(2);
    await syncApplication({ manifest: buildManifest(initial) });
    expect((await readRows()).find(({ locale }) => locale === 'de-DE')).toEqual(
      originalRows[0],
    );
  }, 60000);

  it('rolls back all catalog writes and preserves metadata results on translation failure', async () => {
    await syncApplication({
      manifest: buildManifest({
        'fr-FR': { greeting: 'Bonjour' },
        'de-DE': { greeting: 'Hallo' },
      }),
    });
    const originalRows = await readRows();
    await testDataSource.query(`ALTER TABLE core."applicationTranslation" ADD CONSTRAINT "${CONSTRAINT_NAME}"
      CHECK ("applicationRegistrationId" <> '${applicationRegistrationId}' OR "deletedAt" IS NULL)`);

    const service =
      getAppProviderByClassName<ApplicationTranslationSyncService>(
        'ApplicationTranslationSyncService',
      );
    await expect(
      service.syncFromManifest({
        applicationRegistrationId,
        translations: { 'fr-FR': { greeting: 'Salut' } },
      }),
    ).rejects.toThrow(CONSTRAINT_NAME);
    expect(await readRows()).toEqual(originalRows);

    const response = await syncApplication({
      manifest: buildManifest({ 'fr-FR': { greeting: 'Salut' } }),
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.syncApplication.applicationUniversalIdentifier).toBe(
      TEST_APP_ID,
    );
    expect(response.data.syncApplication.actions).toBeDefined();
    expect(response.data.syncApplication.translationActions).toBeNull();
    expect(await readRows()).toEqual(originalRows);
  }, 60000);
});
