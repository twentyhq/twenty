import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type Manifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();
const VIEW_ID = uuidv4();
const VIEW_FIELD_ID = uuidv4();

const authoredObject = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'roundTripItem',
  namePlural: 'roundTripItems',
  labelSingular: 'Round Trip Item',
  labelPlural: 'Round Trip Items',
  description: 'An item used to verify the export round-trip',
  universalIdentifier: OBJECT_ID,
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  additionalFields: [
    {
      universalIdentifier: NAME_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
  ],
});

const buildTestManifest = (objectOverrides?: Partial<ObjectManifest>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [{ ...authoredObject, ...objectOverrides }],
      views: [
        {
          universalIdentifier: VIEW_ID,
          name: 'All Round Trip Items',
          objectUniversalIdentifier: OBJECT_ID,
          type: ViewType.TABLE,
          icon: 'IconList',
          position: 0,
          isCompact: false,
          fields: [
            {
              universalIdentifier: VIEW_FIELD_ID,
              fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
              position: 0,
              isVisible: true,
              size: 200,
            },
          ],
        },
      ],
    },
  });

const rebuildBuiltManifest = (exported: Manifest): Manifest => {
  const exportedObject = exported.objects[0];

  const exportedFieldUniversalIdentifiers = new Set(
    exportedObject.fields.map((field) => field.universalIdentifier),
  );

  return {
    ...exported,
    objects: [
      {
        ...exportedObject,
        fields: [
          ...exportedObject.fields,
          ...authoredObject.fields.filter(
            (field) =>
              !exportedFieldUniversalIdentifiers.has(field.universalIdentifier),
          ),
        ],
      },
    ],
  };
};

describe('Application manifest export round-trip', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Export Round Trip Application',
      description: 'App for testing exportApplication round-trip',
      sourcePath: 'export-application-round-trip',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('exports authored entities and re-syncing the exported manifest plans zero actions', async () => {
    await syncApplication({
      manifest: buildTestManifest(),
      expectToFail: false,
    });

    const { data } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const exported = data.exportApplication.manifest;

    expect(data.exportApplication.applicationUniversalIdentifier).toBe(
      TEST_APP_ID,
    );

    expect(exported.objects).toHaveLength(1);

    const exportedObject = exported.objects[0];

    expect(exportedObject.universalIdentifier).toBe(OBJECT_ID);
    expect(
      exportedObject.labelIdentifierFieldMetadataUniversalIdentifier,
    ).toBe(NAME_FIELD_ID);
    expect(
      exportedObject.fields.map((field) => field.universalIdentifier),
    ).toEqual([NAME_FIELD_ID]);
    expect(exportedObject.isActive).toBeUndefined();

    expect(
      exported.roles.map((role) => role.universalIdentifier),
    ).toEqual([TEST_ROLE_ID]);
    expect(exported.application.defaultRoleUniversalIdentifier).toBe(
      TEST_ROLE_ID,
    );

    expect(exported.views).toHaveLength(1);
    expect(exported.views[0].universalIdentifier).toBe(VIEW_ID);
    expect(exported.views[0].objectUniversalIdentifier).toBe(OBJECT_ID);
    expect(
      (exported.views[0].fields ?? []).map(
        (viewField) => viewField.universalIdentifier,
      ),
    ).toEqual([VIEW_FIELD_ID]);

    const { data: dryRunData } = await syncApplication({
      manifest: rebuildBuiltManifest(exported),
      dryRun: true,
      expectToFail: false,
    });

    expect(dryRunData.syncApplication.actions).toEqual([]);
  });

  it('round-trips a deactivated object through export without re-activating it', async () => {
    await syncApplication({
      manifest: buildTestManifest({ isActive: false }),
      expectToFail: false,
    });

    const { data } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });

    const exported = data.exportApplication.manifest;

    expect(exported.objects).toHaveLength(1);
    expect(exported.objects[0].isActive).toBe(false);

    const { data: dryRunData } = await syncApplication({
      manifest: rebuildBuiltManifest(exported),
      dryRun: true,
      expectToFail: false,
    });

    expect(dryRunData.syncApplication.actions).toEqual([]);
  });
});
