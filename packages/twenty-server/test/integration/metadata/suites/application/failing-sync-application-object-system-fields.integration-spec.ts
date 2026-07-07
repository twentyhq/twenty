import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest, type ObjectManifest } from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

// Identifiers are pinned so validation error messages embedding expected and
// actual universal identifiers stay stable across snapshot runs.
const TEST_APP_ID = '4e0e42a8-8f9c-4a48-9d43-5e0c5c2f4a10';
const TEST_ROLE_ID = 'd0a24fbc-4b26-42a5-a4ff-2e142f8e2f6d';
const TEST_UUID_NAMESPACE = '6a9c8f74-4b7a-4a86-90f4-2f4dbb1c2a30';

const computeDeterministicTestUuid = (seed: string) =>
  uuidv5(seed, TEST_UUID_NAMESPACE);

type TestContext = {
  manifest: Manifest;
};

type SyncApplicationTestingContext = EachTestingContext<TestContext>[];

const buildManifest = (overrides: Pick<Manifest, 'objects' | 'fields'>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
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
  const objectId = computeDeterministicTestUuid(nameSingular);
  const labelFieldId = computeDeterministicTestUuid(`${nameSingular}-title`);

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

const buildDefaultObjectWithModifiedSearchVector = ({
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  searchVectorOverrides,
}: {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  searchVectorOverrides: Partial<ObjectManifest['fields'][number]>;
}): Pick<Manifest, 'objects' | 'fields'> => {
  const defaultObject = buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: computeDeterministicTestUuid(nameSingular),
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    description,
  });

  return {
    objects: [
      {
        ...defaultObject,
        fields: defaultObject.fields.map((field) =>
          field.name === 'searchVector'
            ? ({
                ...field,
                ...searchVectorOverrides,
              } as (typeof defaultObject.fields)[number])
            : field,
        ),
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
        manifest: buildManifest(
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
        manifest: buildManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongIdTypeObject',
            namePlural: 'wrongIdTypeObjects',
            labelSingular: 'Wrong Id Type Object',
            labelPlural: 'Wrong Id Type Objects',
            description: 'Object with wrong id field type',
            additionalFields: [
              {
                universalIdentifier:
                  computeDeterministicTestUuid('wrongIdTypeObject-id'),
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
      title: 'when object miss default fields',
      context: {
        manifest: buildManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongCreatedAtObject',
            namePlural: 'wrongCreatedAtObjects',
            labelSingular: 'Wrong CreatedAt Object',
            labelPlural: 'Wrong CreatedAt Objects',
            description: 'Object with wrong createdAt field type',
          }),
        ),
      },
    },
    {
      title:
        'when object has position field with wrong type (TEXT instead of POSITION)',
      context: {
        manifest: buildManifest(
          buildObjectWithLabelField({
            nameSingular: 'wrongPositionObject',
            namePlural: 'wrongPositionObjects',
            labelSingular: 'Wrong Position Object',
            labelPlural: 'Wrong Position Objects',
            description: 'Object with wrong position field type',
            additionalFields: [
              {
                universalIdentifier: computeDeterministicTestUuid(
                  'wrongPositionObject-position',
                ),
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
    {
      title:
        'when object has searchVector field with wrong type (TEXT instead of TS_VECTOR)',
      context: {
        manifest: buildManifest(
          buildDefaultObjectWithModifiedSearchVector({
            nameSingular: 'wrongSearchVectorType',
            namePlural: 'wrongSearchVectorTypes',
            labelSingular: 'Wrong SearchVector Type',
            labelPlural: 'Wrong SearchVector Types',
            description: 'Object with wrong searchVector field type',
            searchVectorOverrides: {
              type: FieldMetadataType.TEXT,
            },
          }),
        ),
      },
    },
    {
      title:
        'when object has TS_VECTOR field with wrong name (not searchVector)',
      context: {
        manifest: buildManifest(
          buildDefaultObjectWithModifiedSearchVector({
            nameSingular: 'wrongTsVectorName',
            namePlural: 'wrongTsVectorNames',
            labelSingular: 'Wrong TsVector Name',
            labelPlural: 'Wrong TsVector Names',
            description: 'Object with TS_VECTOR field named incorrectly',
            searchVectorOverrides: {
              name: 'wrongSearchVector',
            },
          }),
        ),
      },
    },
    {
      title:
        'when object has a system field with a custom (non-derived) universal identifier',
      context: (() => {
        const defaultObject = buildDefaultObjectManifest({
          applicationUniversalIdentifier: TEST_APP_ID,
          universalIdentifier: computeDeterministicTestUuid(
            'customSystemFieldUidObject',
          ),
          nameSingular: 'customSystemFieldUidObject',
          namePlural: 'customSystemFieldUidObjects',
          labelSingular: 'Custom System Field Uid Object',
          labelPlural: 'Custom System Field Uid Objects',
          description:
            'Object with a createdAt system field carrying a custom universal identifier',
        });

        return {
          manifest: buildManifest({
            objects: [
              {
                ...defaultObject,
                fields: defaultObject.fields.map((field) =>
                  field.name === 'createdAt'
                    ? {
                        ...field,
                        universalIdentifier:
                          '899ac540-3a1f-42cf-9f99-8a55e79d0d9e',
                      }
                    : field,
                ),
              },
            ],
            fields: [],
          }),
        };
      })(),
    },
    {
      title:
        'when label identifier is non-searchable type (searchVector has no expression)',
      context: (() => {
        const nonSearchableFieldId = computeDeterministicTestUuid(
          'noSearchVectorExpression-quantity',
        );

        return {
          manifest: buildManifest({
            objects: [
              buildDefaultObjectManifest({
                applicationUniversalIdentifier: TEST_APP_ID,
                universalIdentifier: computeDeterministicTestUuid(
                  'noSearchVectorExpression',
                ),
                nameSingular: 'noSearchVectorExpression',
                namePlural: 'noSearchVectorExpressions',
                labelSingular: 'No SearchVector Expression',
                labelPlural: 'No SearchVector Expressions',
                description:
                  'Object whose label identifier is non-searchable, so searchVector has no expression',
                labelIdentifierFieldMetadataUniversalIdentifier:
                  nonSearchableFieldId,
                additionalFields: [
                  {
                    universalIdentifier: nonSearchableFieldId,
                    type: FieldMetadataType.NUMBER,
                    name: 'quantity',
                    label: 'Quantity',
                  },
                ],
              }),
            ],
            fields: [],
          }),
        };
      })(),
    },
  ];

describe('Sync application should fail due to object system fields integrity', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test System Fields App',
      description: 'App for testing system field validation',
      sourcePath: 'test-system-fields',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
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
    const labelIdentifierFieldUniversalIdentifier = uuidv4();
    const testObject = buildDefaultObjectManifest({
      applicationUniversalIdentifier: TEST_APP_ID,
      nameSingular: 'deleteSystemFieldObject',
      namePlural: 'deleteSystemFieldObjects',
      labelSingular: 'Delete System Field Object',
      labelPlural: 'Delete System Field Objects',
      description: 'Object for testing system field deletion',
      labelIdentifierFieldMetadataUniversalIdentifier:
        labelIdentifierFieldUniversalIdentifier,
      additionalFields: [
        {
          universalIdentifier: labelIdentifierFieldUniversalIdentifier,
          type: FieldMetadataType.TEXT,
          name: 'labelIdentifierField',
          label: 'Label Identifier Field',
          description: 'Label identifier field',
          icon: 'IconTextCaption',
        },
      ],
    });

    const validManifest = buildManifest({
      objects: [testObject],
      fields: [],
    });

    await syncApplication({
      manifest: validManifest,
      expectToFail: false,
    });

    const manifestWithDeletedIdField = buildManifest({
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
    const labelIdentifierFieldUniversalIdentifier = uuidv4();
    const testObject = buildDefaultObjectManifest({
      applicationUniversalIdentifier: TEST_APP_ID,
      nameSingular: 'updateSystemFieldObject',
      namePlural: 'updateSystemFieldObjects',
      labelSingular: 'Update System Field Object',
      labelPlural: 'Update System Field Objects',
      description: 'Object for testing system field update',
      labelIdentifierFieldMetadataUniversalIdentifier:
        labelIdentifierFieldUniversalIdentifier,
      additionalFields: [
        {
          universalIdentifier: labelIdentifierFieldUniversalIdentifier,
          type: FieldMetadataType.TEXT,
          name: 'labelIdentifierField',
          label: 'Label Identifier Field',
          description: 'Label identifier field',
          icon: 'IconTextCaption',
        },
      ],
    });

    const validManifest = buildManifest({
      objects: [testObject],
      fields: [],
    });

    await syncApplication({
      manifest: validManifest,
      expectToFail: false,
    });

    const manifestWithUpdatedIdField = buildManifest({
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
