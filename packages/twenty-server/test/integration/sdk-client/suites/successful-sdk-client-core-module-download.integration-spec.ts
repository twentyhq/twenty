import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { buildUniqueMetadataName } from 'test/integration/sdk-client/utils/build-unique-metadata-name.util';
import { downloadSdkClientCoreModule } from 'test/integration/sdk-client/utils/download-sdk-client-core-module.util';
import { loadSdkClientCoreModule } from 'test/integration/sdk-client/utils/load-sdk-client-core-module.util';
import { syncSdkClientProbeApplication } from 'test/integration/sdk-client/utils/sync-sdk-client-probe-application.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const ORDINARY_OBJECT_DESCRIPTION = [
  'Deals tracked by the sales team.',
  'Amounts use `cents`, templates look like ${amount}, quotes are "double" or \'single\'.',
  'A /* nested opener and a // line marker stay plain text.',
  '@deprecated is only a word here, and so is <script>.',
].join('\n');

const ORDINARY_FIELD_DESCRIPTION =
  'Total in cents; display with amount / 100 and see https://example.com/docs?a=1&b=2#notes';

const downloaderTestCases: EachTestingContext<{ token: string }>[] = [
  {
    title: 'a member without any permission flag',
    context: { token: APPLE_JONY_MEMBER_ACCESS_TOKEN },
  },
  {
    title: 'an API key',
    context: { token: API_KEY_ACCESS_TOKEN },
  },
];

describe('SDK client core module download', () => {
  describe('with ordinary descriptions', () => {
    let applicationUniversalIdentifier: string;

    beforeEach(() => {
      applicationUniversalIdentifier = uuidv4();
    });

    afterEach(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    });

    it('serves a module that loads and exposes the core client', async () => {
      const nameSingular = buildUniqueMetadataName('sdkProbeDeal');

      const { applyErrors, coreModuleResponse } =
        await syncSdkClientProbeApplication({
          applicationUniversalIdentifier,
          objects: [
            buildDefaultObjectManifest({
              applicationUniversalIdentifier,
              nameSingular,
              namePlural: `${nameSingular}s`,
              labelSingular: nameSingular,
              labelPlural: `${nameSingular}s`,
              description: ORDINARY_OBJECT_DESCRIPTION,
              additionalFields: [
                {
                  universalIdentifier: uuidv4(),
                  type: FieldMetadataType.NUMBER,
                  name: 'amount',
                  label: 'Amount',
                  description: ORDINARY_FIELD_DESCRIPTION,
                },
              ],
            }),
          ],
        });

      expect(applyErrors).toBeUndefined();
      expect(coreModuleResponse.status).toBe(200);

      const coreModule = await loadSdkClientCoreModule(coreModuleResponse.text);

      expect(typeof coreModule.CoreApiClient).toBe('function');
      expect(typeof coreModule.createClient).toBe('function');
    });
  });

  describe.each(eachTestingContextFilter(downloaderTestCases))(
    'by $title',
    ({ context }) => {
      it('serves the workspace custom application module', async () => {
        const response = await downloadSdkClientCoreModule({
          applicationId: await findWorkspaceCustomApplicationId(),
          token: context.token,
        });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(
          /application\/javascript/,
        );

        const coreModule = await loadSdkClientCoreModule(response.text);

        expect(typeof coreModule.CoreApiClient).toBe('function');
      });
    },
  );
});
