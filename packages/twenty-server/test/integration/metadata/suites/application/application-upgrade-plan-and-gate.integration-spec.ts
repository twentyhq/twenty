import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createTestTarball } from 'test/integration/metadata/suites/application/utils/create-test-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { planApplicationUpgrade } from 'test/integration/metadata/suites/application/utils/plan-application-upgrade.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const REMOVABLE_FIELD_ID = uuidv4();

const OBJECT_WITH_FIELD = buildDefaultObjectManifest({
  nameSingular: 'upgradeGateRecord',
  namePlural: 'upgradeGateRecords',
  labelSingular: 'Upgrade Gate Record',
  labelPlural: 'Upgrade Gate Records',
  description: 'Object for the upgrade destructive-gate test',
  additionalFields: [
    {
      universalIdentifier: REMOVABLE_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'removableNotes',
      label: 'Removable notes',
    },
  ],
});

const OBJECT_WITHOUT_FIELD = {
  ...OBJECT_WITH_FIELD,
  fields: OBJECT_WITH_FIELD.fields.filter(
    (field) => field.universalIdentifier !== REMOVABLE_FIELD_ID,
  ),
};

const buildTarball = async (params: {
  withField: boolean;
  version: string;
}): Promise<Buffer> => {
  const manifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [params.withField ? OBJECT_WITH_FIELD : OBJECT_WITHOUT_FIELD],
    },
  });

  return createTestTarball({
    'manifest.json': JSON.stringify(manifest),
    'package.json': JSON.stringify({
      name: 'upgrade-gate-app',
      version: params.version,
    }),
  });
};

const findObjectNames = async (): Promise<string[]> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id nameSingular',
    expectToFail: false,
  });

  return objects.map((object) => object.nameSingular);
};

describe('Application upgrade — plan preview and destructive gate', () => {
  let appRegistrationId: string;

  beforeAll(async () => {
    jest.useRealTimers();

    const upload = await uploadAppTarball({
      tarballBuffer: await buildTarball({ withField: true, version: '1.0.0' }),
      universalIdentifier: TEST_APP_ID,
    });

    appRegistrationId = upload.data!.uploadAppTarball.id;

    await installApplication({
      input: { universalIdentifier: TEST_APP_ID, version: '1.0.0' },
      expectToFail: false,
    });
  }, 90000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
    jest.useFakeTimers();
  });

  it('previews a destructive upgrade and refuses it unless allowDestructive is set', async () => {
    expect(await findObjectNames()).toContain('upgradeGateRecord');

    await uploadAppTarball({
      tarballBuffer: await buildTarball({ withField: false, version: '2.0.0' }),
      universalIdentifier: TEST_APP_ID,
    });

    const plan = (
      await planApplicationUpgrade({
        appRegistrationId,
        targetVersion: '2.0.0',
      })
    ).data.planApplicationUpgrade;

    expect(plan.hasDestructiveActions).toBe(true);
    expect(plan.summary.destructiveCount).toBeGreaterThanOrEqual(1);

    const blocked = await installApplication({
      input: { universalIdentifier: TEST_APP_ID, version: '2.0.0' },
      expectToFail: true,
    });

    expect(JSON.stringify(blocked.errors)).toContain(
      'DESTRUCTIVE_CHANGES_NOT_APPROVED',
    );

    await installApplication({
      input: {
        universalIdentifier: TEST_APP_ID,
        version: '2.0.0',
        allowDestructive: true,
      },
      expectToFail: false,
    });
  }, 90000);
});
