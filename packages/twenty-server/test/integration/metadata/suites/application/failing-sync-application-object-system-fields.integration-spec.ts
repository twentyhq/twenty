import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { type Manifest, type ObjectManifest } from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

type TestContext = {
  manifest: Manifest;
};

type SyncApplicationTestingContext = EachTestingContext<TestContext>[];

const buildBaseManifest = (
  overrides: Pick<Manifest, 'objects' | 'fields'>,
): Manifest => ({
  application: {
    apiClientChecksum: '',
    marketplaceData: undefined,
    universalIdentifier: TEST_APP_ID,
    defaultRoleUniversalIdentifier: TEST_ROLE_ID,
    displayName: 'Test System Fields App',
    description: 'App for testing system field validation',
    icon: 'IconTestPipe',
    applicationVariables: {},
    packageJsonChecksum: null,
    yarnLockChecksum: null,
  },
  roles: [
    {
      universalIdentifier: TEST_ROLE_ID,
      label: 'Test Role',
      description: 'A test role',
    },
  ],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  ...overrides,
});

const buildObjectWithLabelField = ({
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  additionalFields = [],
}: {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  additionalFields?: ObjectManifest['fields'];
}): Pick<Manifest, 'objects' | 'fields'> => {
  const objectId = uuidv4();
  const labelFieldId = uuidv4();

  return {
    objects: [
      {
        universalIdentifier: objectId,
        labelIdentifierFieldMetadataUniversalIdentifier: labelFieldId,
        nameSingular,
        namePlural,
        labelSingular,
        labelPlural,
        description,
        icon: 'IconTicket',
        fields: [
          {
            universalIdentifier: labelFieldId,
            type: FieldMetadataType.TEXT,
            name: 'title',
            label: 'Title',
            description: 'Label identifier field',
            icon: 'IconTextCaption',
          },
          ...additionalFields,
        ],
      },
    ],
    fields: [],
  };
};

const failingSyncApplicationSystemFieldsTestCases: SyncApplicationTestingContext =
  [
    {
      title:
        'when object is created without any system fields (missing all 8 system fields)',
      context: {
        manifest: buildBaseManifest(
          buildObjectWithLabelField({
            nameSingular: 'noSystemFieldsObject',
            namePlural: 'noSystemFieldsObjects',
            labelSingular: 'No System Fields Object',
            labelPlural: 'No System Fields Objects',
            description: 'Object with no system fields',
          }),
        ),
      },
    },
    {
      title: 'when object has id field with wrong type (TEXT instead of UUID)',
      context: {
        manifest: buildBaseManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongIdTypeObject',
            namePlural: 'wrongIdTypeObjects',
            labelSingular: 'Wrong Id Type Object',
            labelPlural: 'Wrong Id Type Objects',
            description: 'Object with wrong id field type',
            additionalFields: [
              {
                universalIdentifier: uuidv4(),
                type: FieldMetadataType.TEXT,
                name: 'id',
                label: 'Id',
                description: 'Id field with wrong type',
                icon: 'IconKey',
              },
            ],
          }),
        ),
      },
    },
    {
      title:
        'when object has createdAt field with wrong type (TEXT instead of DATE_TIME)',
      context: {
        manifest: buildBaseManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongCreatedAtObject',
            namePlural: 'wrongCreatedAtObjects',
            labelSingular: 'Wrong CreatedAt Object',
            labelPlural: 'Wrong CreatedAt Objects',
            description: 'Object with wrong createdAt field type',
            additionalFields: [
              {
                universalIdentifier: uuidv4(),
                type: FieldMetadataType.TEXT,
                name: 'createdAt',
                label: 'Created At',
                description: 'Created at field with wrong type',
                icon: 'IconCalendar',
              },
            ],
          }),
        ),
      },
    },
    {
      title:
        'when object has position field with wrong type (TEXT instead of POSITION)',
      context: {
        manifest: buildBaseManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongPositionObject',
            namePlural: 'wrongPositionObjects',
            labelSingular: 'Wrong Position Object',
            labelPlural: 'Wrong Position Objects',
            description: 'Object with wrong position field type',
            additionalFields: [
              {
                universalIdentifier: uuidv4(),
                type: FieldMetadataType.TEXT,
                name: 'position',
                label: 'Position',
                description: 'Position field with wrong type',
                icon: 'IconArrowsSort',
              },
            ],
          }),
        ),
      },
    },
  ];

describe('Sync application should fail due to object system fields integrity', () => {
  let appCreated = false;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test System Fields App',
      description: 'App for testing system field validation',
      sourcePath: 'test-system-fields',
    });

    appCreated = true;
  }, 60000);

  afterEach(async () => {
    if (!appCreated) {
      return;
    }

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it.each(
    eachTestingContextFilter(failingSyncApplicationSystemFieldsTestCases),
  )(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: context.manifest,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );

  it('should fail when trying to delete a system field after a successful sync', async () => {
    const testObject = buildDefaultObjectManifest({
      nameSingular: 'deleteSystemFieldObject',
      namePlural: 'deleteSystemFieldObjects',
      labelSingular: 'Delete System Field Object',
      labelPlural: 'Delete System Field Objects',
      description: 'Object for testing system field deletion',
    });

    const validManifest = buildBaseManifest({
      objects: [testObject],
      fields: [],
    });

    await syncApplication({
      manifest: validManifest,
      expectToFail: false,
    });

    const manifestWithDeletedIdField = buildBaseManifest({
      objects: [
        {
          ...testObject,
          fields: testObject.fields.filter((field) => field.name !== 'id'),
        },
      ],
      fields: [],
    });

    const { errors } = await syncApplication({
      manifest: manifestWithDeletedIdField,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should fail when trying to update a system field after a successful sync', async () => {
    const testObject = buildDefaultObjectManifest({
      nameSingular: 'updateSystemFieldObject',
      namePlural: 'updateSystemFieldObjects',
      labelSingular: 'Update System Field Object',
      labelPlural: 'Update System Field Objects',
      description: 'Object for testing system field update',
    });

    const validManifest = buildBaseManifest({
      objects: [testObject],
      fields: [],
    });

    await syncApplication({
      manifest: validManifest,
      expectToFail: false,
    });

    const manifestWithUpdatedIdField = buildBaseManifest({
      objects: [
        {
          ...testObject,
          fields: testObject.fields.map((field) =>
            field.name === 'id'
              ? { ...field, label: 'Modified Id Label' }
              : field,
          ),
        },
      ],
      fields: [],
    });

    const { errors } = await syncApplication({
      manifest: manifestWithUpdatedIdField,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
