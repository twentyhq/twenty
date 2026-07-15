import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type MetadataValidationErrorExtensions = {
  code?: string;
  errors?: {
    fieldMetadata?: { errors: { code: string }[] }[];
  };
};

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();

const OBJECT_NAME_SINGULAR = 'searchVectorHijackTarget';
const OBJECT_NAME_PLURAL = 'searchVectorHijackTargets';

const SEARCH_VECTOR_UNIVERSAL_IDENTIFIER = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: TEST_APP_ID,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'searchVector',
});

const buildCleanObject = (): ObjectManifest =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    nameSingular: OBJECT_NAME_SINGULAR,
    namePlural: OBJECT_NAME_PLURAL,
    labelSingular: 'Search Vector Hijack Target',
    labelPlural: 'Search Vector Hijack Targets',
    description: 'Object used to test search vector identifier hijack',
    universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

// Rebuild the same object but repurpose the engine-owned searchVector slot: reuse
// its deterministic universal identifier for a foreign, non-system field with a
// different name and type. This is the exact override a malicious manifest could
// attempt on a second sync to hijack a system field.
const buildObjectHijackingSearchVector = (): ObjectManifest => {
  const cleanObject = buildCleanObject();

  return {
    ...cleanObject,
    fields: cleanObject.fields.map((field) =>
      field.universalIdentifier === SEARCH_VECTOR_UNIVERSAL_IDENTIFIER
        ? {
            universalIdentifier: SEARCH_VECTOR_UNIVERSAL_IDENTIFIER,
            type: FieldMetadataType.TEXT,
            name: 'stolenSearchVector',
            label: 'Stolen Search Vector',
            isNullable: true,
          }
        : field,
    ),
  };
};

describe('Sync application should reject hijacking the searchVector universal identifier', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Search Vector Hijack App',
      description: 'App for testing search vector identifier hijack',
      sourcePath: 'test-search-vector-hijack',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: { objects: [buildCleanObject()] },
      }),
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should reject a second sync that reuses the searchVector deterministic identifier to override its name and settings', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
        overrides: { objects: [buildObjectHijackingSearchVector()] },
      }),
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);

    const [firstError] = errors;
    const extensions =
      firstError.extensions as MetadataValidationErrorExtensions;

    expect(extensions.code).not.toBe('INTERNAL_SERVER_ERROR');

    const fieldMetadataErrorCodes = (
      extensions.errors?.fieldMetadata ?? []
    ).flatMap((failure) => failure.errors.map((error) => error.code));

    expect(fieldMetadataErrorCodes).toContain(
      FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
    );
  }, 60000);
});
