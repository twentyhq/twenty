import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
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

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'defaultRelationCollisionTarget';
const OBJECT_NAME_PLURAL = 'defaultRelationCollisionTargets';

// The engine forward field of the attachment default relation is named after
// the standard object's namePlural and derives its universal identifier from
// (app, object, name) - the same derivation the SDK applies to manifest fields.
const DERIVED_ATTACHMENTS_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_ID,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'attachments',
});

const buildObjectWithAttachmentsField = ({
  attachmentsFieldUniversalIdentifier,
}: {
  attachmentsFieldUniversalIdentifier: string;
}): ObjectManifest =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    nameSingular: OBJECT_NAME_SINGULAR,
    namePlural: OBJECT_NAME_PLURAL,
    labelSingular: 'Default Relation Collision Target',
    labelPlural: 'Default Relation Collision Targets',
    description: 'Object used to test default relation name collisions',
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    additionalFields: [
      {
        universalIdentifier: attachmentsFieldUniversalIdentifier,
        type: FieldMetadataType.TEXT,
        name: 'attachments',
        label: 'Caller Attachments',
        isNullable: true,
      },
    ],
  });

describe('Sync application default relation name collision', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Default Relation Name Collision App',
      description: 'App for testing default relation name collisions',
      sourcePath: 'test-default-relation-name-collision',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should reject a manifest field named after a default relation when it carries a pinned universal identifier', async () => {
    // The pinned identifier differs from the derived forward field identifier,
    // so the create side-effect handler does not detect an override and emits
    // its own "attachments" RELATION field - colliding on name.
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: {
          objects: [
            buildObjectWithAttachmentsField({
              attachmentsFieldUniversalIdentifier: uuidv4(),
            }),
          ],
        },
      }),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);

  it('should let a manifest field named after a default relation win when it carries the derived universal identifier', async () => {
    // With the derived identifier the create side-effect handler detects the
    // override and skips the whole attachment bundle, while the three other
    // default relations are still provisioned.
    await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: {
          objects: [
            buildObjectWithAttachmentsField({
              attachmentsFieldUniversalIdentifier:
                DERIVED_ATTACHMENTS_UNIVERSAL_IDENTIFIER,
            }),
          ],
        },
      }),
      expectToFail: false,
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: 'id nameSingular',
    });

    const createdObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === OBJECT_NAME_SINGULAR,
    );

    expect(createdObject).toBeDefined();

    if (!isDefined(createdObject)) {
      throw new Error('expected the synced object to exist');
    }

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: createdObject.id } },
        paging: { first: 100 },
      },
      gqlFields: 'id name type universalIdentifier',
    });

    const fetchedFields = fields.map(
      (edge: {
        node: { name: string; type: string; universalIdentifier: string };
      }) => edge.node,
    );

    const attachmentsField = fetchedFields.find(
      (field: { name: string }) => field.name === 'attachments',
    );

    expect(attachmentsField).toBeDefined();
    expect(attachmentsField?.type).toBe(FieldMetadataType.TEXT);
    expect(attachmentsField?.universalIdentifier).toBe(
      DERIVED_ATTACHMENTS_UNIVERSAL_IDENTIFIER,
    );

    const noteTargetsField = fetchedFields.find(
      (field: { name: string }) => field.name === 'noteTargets',
    );

    expect(noteTargetsField).toBeDefined();
    expect(noteTargetsField?.type).toBe(FieldMetadataType.RELATION);
  }, 60000);
});
