import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

// The reserved system fields are the only fields the manifest sync funnel
// synthesizes server-side (through the objectMetadata side-effect engine). The
// name field and the default relations are caller-provided defaults (SDK
// auto-complete on the real manifest path), so they are intentionally out of
// scope here: the manifest funnel never derives their universal identifiers.
const SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
];

const TEST_APP_UNIVERSAL_IDENTIFIER = uuidv4();
const TEST_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();
// The name field is a caller-provided default: we give it a random universal
// identifier and use it as the label identifier so the manifest is valid without
// pre-deriving any system field universal identifier from the test definition.
const NAME_FIELD_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'rocketForManifestUniversalIdentifier';

// The manifest deliberately declares no system field: it only carries the base
// object universal identifier and a caller-provided name field. Every system
// field universal identifier asserted below is therefore derived by the server,
// never provided by this test definition.
const TEST_OBJECT: ObjectManifest = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  nameSingular: OBJECT_NAME_SINGULAR,
  namePlural: `${OBJECT_NAME_SINGULAR}s`,
  labelSingular: 'Rocket For Manifest Universal Identifier',
  labelPlural: 'Rockets For Manifest Universal Identifier',
  description: 'A rocket synced through the manifest funnel',
  icon: 'IconRocket',
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
  ],
};

type FetchedField = {
  id: string;
  name: string;
  universalIdentifier: string;
};

describe('Application manifest sync deterministic system field universal identifiers', () => {
  let objectUniversalIdentifier: string;
  let fetchedFields: FetchedField[];

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync-deterministic',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: TEST_APP_UNIVERSAL_IDENTIFIER,
        roleId: TEST_ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { objects: [TEST_OBJECT] },
      }),
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: 'id nameSingular universalIdentifier',
    });

    const syncedObject = objects.find(
      (object) => object.universalIdentifier === OBJECT_UNIVERSAL_IDENTIFIER,
    );

    if (!isDefined(syncedObject)) {
      throw new Error(
        'Could not resolve the object synced through the manifest funnel',
      );
    }

    objectUniversalIdentifier = syncedObject.universalIdentifier;

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: syncedObject.id } },
        paging: { first: 100 },
      },
      gqlFields: `
        id
        name
        universalIdentifier
      `,
    });

    fetchedFields = fields.map((edge: { node: FetchedField }) => edge.node);
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
    });
  });

  it.each(SYSTEM_FIELD_NAMES)(
    'should derive the %s system field universal identifier deterministically through the manifest sync funnel',
    (systemFieldName) => {
      const systemField = fetchedFields.find(
        (field) => field.name === systemFieldName,
      );

      expect(systemField).toBeDefined();
      expect(systemField?.universalIdentifier).toBe(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: TEST_APP_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier,
          name: systemFieldName,
        }),
      );
    },
  );
});
