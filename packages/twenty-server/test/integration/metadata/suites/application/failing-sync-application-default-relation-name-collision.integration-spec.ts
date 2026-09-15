import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getSystemRelationFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'defaultRelationCollisionTarget';
const OBJECT_NAME_PLURAL = 'defaultRelationCollisionTargets';

// The engine forward field of the attachment default relation derives its
// universal identifier name-free from the host and relation target object
// identifiers, so a manifest field can only squat it by pinning that exact
// derived value.
const DERIVED_ATTACHMENTS_UNIVERSAL_IDENTIFIER =
  getSystemRelationFieldUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    relationTargetObjectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
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

// The default relations are engine-owned: the create side-effect handler
// always emits them, so a manifest field can never take their place. It either
// collides on name (random identifier) or on universal identifier (derived
// identifier), and both collisions hard-fail the sync.
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
    // so the side-effect "attachments" RELATION field and the manifest TEXT
    // field coexist in the create bucket and collide on name in the validator.
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

  it('should reject a manifest field named after a default relation when it carries the derived universal identifier', async () => {
    // With the derived identifier the manifest field collides with the
    // side-effect forward field on universal identifier: the engine merge
    // detects a caller entity squatting a system-reserved identifier and
    // hard-fails (RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER).
    const { errors } = await syncApplication({
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
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
