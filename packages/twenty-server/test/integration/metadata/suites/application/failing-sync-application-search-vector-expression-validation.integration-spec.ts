import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { type Manifest, type ObjectManifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

describe('Sync application - search vector expression is validated', () => {
  const RUN_SUFFIX = `${Date.now()}`;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test SearchVector Expression App',
      description: 'App for testing search vector expression validation',
      sourcePath: 'test-search-vector-expression',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('rejects a manifest carrying a malformed searchVector expression', async () => {
    const defaultObject = buildDefaultObjectManifest({
      nameSingular: `searchVectorManifestObject${RUN_SUFFIX}`,
      namePlural: `searchVectorManifestObjects${RUN_SUFFIX}`,
      labelSingular: 'Search Vector Manifest Object',
      labelPlural: 'Search Vector Manifest Objects',
      description:
        'Object whose manifest carries a malformed searchVector expression',
    });

    const invalidAsExpression = `to_tsvector('simple', coalesce("id"::text, '')`;

    const objectWithInvalidSearchVector: ObjectManifest = {
      ...defaultObject,
      fields: defaultObject.fields.map((field) =>
        field.name === 'searchVector'
          ? ({
              ...field,
              universalSettings: {
                asExpression: invalidAsExpression,
                generatedType: 'STORED',
              },
            } as (typeof defaultObject.fields)[number])
          : field,
      ),
    };

    const manifest: Manifest = buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        objects: [objectWithInvalidSearchVector],
        fields: [],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    jestExpectToBeDefined(errors);
  }, 60000);
});
