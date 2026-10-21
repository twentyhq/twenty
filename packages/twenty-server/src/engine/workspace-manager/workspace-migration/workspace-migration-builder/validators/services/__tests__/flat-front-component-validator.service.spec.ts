import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { FlatFrontComponentValidatorService } from '../flat-front-component-validator.service';

const COMPONENT_ID = 'd941095a-cd60-472b-9672-59364b2c1b63';
const AI_SOURCE_PATH = `src/ai-front-components/${COMPONENT_ID}.front-component.tsx`;
const APPLICATION_ID = '2b628b80-5a1b-481e-8df5-e81b2f5303ab';

describe('front component runtime preservation', () => {
  it.each([
    {
      sourceComponentPath: AI_SOURCE_PATH,
      update: { sourceComponentPath: 'src/renamed.front-component.tsx' },
      blocked: true,
    },
    {
      sourceComponentPath:
        'src/ai-front-components/34c1d6b7-271b-442b-93b1-50164a59db45.front-component.tsx',
      update: { sourceComponentPath: 'src/renamed.front-component.tsx' },
      blocked: true,
    },
    {
      sourceComponentPath: AI_SOURCE_PATH,
      update: { sourceComponentPath: undefined },
      blocked: true,
    },
    {
      sourceComponentPath: AI_SOURCE_PATH,
      update: { sourceComponentPath: AI_SOURCE_PATH },
      blocked: false,
    },
    {
      sourceComponentPath: AI_SOURCE_PATH,
      update: { name: 'Renamed component' },
      blocked: false,
    },
    {
      sourceComponentPath: 'src/ordinary.front-component.tsx',
      update: { sourceComponentPath: 'src/moved.front-component.tsx' },
      blocked: false,
    },
    {
      sourceComponentPath: 'src/ordinary.front-component.tsx',
      update: { sourceComponentPath: AI_SOURCE_PATH },
      blocked: false,
    },
    {
      sourceComponentPath: `src/ai-front-components/${COMPONENT_ID}/component.front-component.tsx`,
      update: { sourceComponentPath: 'src/moved.front-component.tsx' },
      blocked: false,
    },
    {
      sourceComponentPath:
        'src/ai-front-components/ordinary.front-component.tsx',
      update: { sourceComponentPath: 'src/moved.front-component.tsx' },
      blocked: false,
    },
  ])(
    'validates a path transition without restricting ordinary updates (%j)',
    ({ sourceComponentPath, update, blocked }) => {
      const component = fromFrontComponentManifestToUniversalFlatFrontComponent(
        {
          frontComponentManifest: {
            universalIdentifier: COMPONENT_ID,
            name: 'Companies',
            componentName: 'Companies',
            sourceComponentPath,
            builtComponentPath: 'src/companies.mjs',
            builtComponentChecksum: 'checksum',
          },
          applicationUniversalIdentifier: APPLICATION_ID,
          isSettingsFrontComponent: false,
          now: new Date().toISOString(),
        },
      );
      const flatFrontComponentMaps = {
        byUniversalIdentifier: { [COMPONENT_ID]: component },
      };
      const result =
        new FlatFrontComponentValidatorService().validateFlatFrontComponentUpdate(
          {
            universalIdentifier: COMPONENT_ID,
            flatEntityUpdate: update,
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
              ...createEmptyAllFlatEntityMaps(),
              flatFrontComponentMaps,
            },
            finalFlatEntityMaps: flatFrontComponentMaps,
            workspaceId: 'workspace',
            buildOptions: {
              isSystemBuild: false,
              applicationUniversalIdentifier: APPLICATION_ID,
            },
            additionalCacheDataMaps: {
              billingEntitlements: {},
              featureFlagsMap:
                {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
            },
          },
        );

      if (blocked) {
        expect(result.errors).toEqual([
          expect.objectContaining({
            message:
              'The source path of an AI-built component cannot be changed',
          }),
        ]);
      } else {
        expect(result.errors).toEqual([]);
      }
    },
  );
});
