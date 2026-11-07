/* @license Enterprise */

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PATH_ID = uuidv4();

const RELATED_RECORD_PATH_MANIFEST = {
  universalIdentifier: TEST_PATH_ID,
  objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
  firstFieldMetadataUniversalIdentifier:
    STANDARD_OBJECTS.person.fields.messageParticipants.universalIdentifier,
  isInherent: true,
};

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'relatedRecordPaths'>>,
) => buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findRelatedRecordPathRows = async (): Promise<
  { isInherent: boolean; secondFieldMetadataId: string | null }[]
> =>
  globalThis.testDataSource.query(
    `SELECT "isInherent", "secondFieldMetadataId" FROM "core"."relatedRecordPath"
     WHERE "universalIdentifier" = $1`,
    [TEST_PATH_ID],
  );

describe('Manifest sync - related record paths', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Related Record Path Test Application',
      description: 'App for testing related record path manifest sync',
      sourcePath: 'related-record-path-manifest-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates the declared path and deletes it once removed from the manifest', async () => {
    await syncApplication({
      manifest: buildManifest({
        relatedRecordPaths: [RELATED_RECORD_PATH_MANIFEST],
      }),
      expectToFail: false,
    });

    expect(await findRelatedRecordPathRows()).toEqual([
      { isInherent: true, secondFieldMetadataId: null },
    ]);

    await syncApplication({
      manifest: buildManifest({ relatedRecordPaths: [] }),
      expectToFail: false,
    });

    expect(await findRelatedRecordPathRows()).toEqual([]);
  }, 60000);

  it('exports the declared path back into the manifest', async () => {
    await syncApplication({
      manifest: buildManifest({
        relatedRecordPaths: [RELATED_RECORD_PATH_MANIFEST],
      }),
      expectToFail: false,
    });

    const { data, errors } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.exportApplication.manifest.relatedRecordPaths).toEqual([
      RELATED_RECORD_PATH_MANIFEST,
    ]);
  }, 60000);

  it('rejects a path whose field does not belong to its object', async () => {
    const response = await syncApplication({
      manifest: buildManifest({
        relatedRecordPaths: [
          {
            ...RELATED_RECORD_PATH_MANIFEST,
            objectUniversalIdentifier:
              STANDARD_OBJECTS.company.universalIdentifier,
          },
        ],
      }),
      expectToFail: true,
    });

    expect(JSON.stringify(response.errors)).toContain(
      'Each related record path field must belong to the object reached by the previous relation',
    );
    expect(await findRelatedRecordPathRows()).toEqual([]);
  }, 60000);
});
