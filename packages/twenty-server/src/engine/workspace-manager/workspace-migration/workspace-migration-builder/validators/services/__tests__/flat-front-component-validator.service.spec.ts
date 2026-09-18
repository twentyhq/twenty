import { FlatFrontComponentValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-front-component-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '22222222-2222-4222-8222-222222222222';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '33333333-3333-4333-8333-333333333333';
const SIBLING_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';

const DEFAULT_TAB_COLLISION_MESSAGE =
  'Only one settings front component can take the default settings tab';

const buildFlatFrontComponent = ({
  universalIdentifier,
  applicationUniversalIdentifier = APPLICATION_UNIVERSAL_IDENTIFIER,
  settingsTab,
}: {
  universalIdentifier: string;
  applicationUniversalIdentifier?: string;
  settingsTab?: object | null;
}) => ({
  universalIdentifier,
  applicationUniversalIdentifier,
  name: 'app-settings',
  description: null,
  sourceComponentPath: 'src/front-components/app-settings.tsx',
  builtComponentPath: 'src/front-components/app-settings.mjs',
  componentName: 'AppSettings',
  builtComponentChecksum: '',
  isHeadless: false,
  usesSdkClient: false,
  settingsTab: settingsTab ?? null,
  createdAt: '2026-09-18T00:00:00.000Z',
  updatedAt: '2026-09-18T00:00:00.000Z',
});

const buildMaps = (flatFrontComponents: { universalIdentifier: string }[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFrontComponents.map((flatFrontComponent) => [
      flatFrontComponent.universalIdentifier,
      flatFrontComponent,
    ]),
  ),
});

const buildCreationArgs = ({
  flatFrontComponent,
  optimisticFlatFrontComponents = [],
  remainingFlatFrontComponents = [],
}: {
  flatFrontComponent: ReturnType<typeof buildFlatFrontComponent>;
  optimisticFlatFrontComponents?: ReturnType<typeof buildFlatFrontComponent>[];
  remainingFlatFrontComponents?: ReturnType<typeof buildFlatFrontComponent>[];
}) =>
  ({
    flatEntityToValidate: flatFrontComponent,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: buildMaps(optimisticFlatFrontComponents),
    },
    remainingFlatEntityMapsToValidate: buildMaps(remainingFlatFrontComponents),
  }) as unknown as Parameters<
    FlatFrontComponentValidatorService['validateFlatFrontComponentCreation']
  >[0];

describe('FlatFrontComponentValidatorService', () => {
  const service = new FlatFrontComponentValidatorService();

  const getErrorMessages = (validationResult: {
    errors: { message: string }[];
  }) => validationResult.errors.map(({ message }) => message);

  describe('default settings tab collisions', () => {
    it('should accept the only component taking the default tab', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            settingsTab: {},
          }),
          optimisticFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: SIBLING_UNIVERSAL_IDENTIFIER,
              settingsTab: { label: 'Sync' },
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).not.toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });

    it('should reject a second component taking the default tab', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            settingsTab: {},
          }),
          optimisticFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: SIBLING_UNIVERSAL_IDENTIFIER,
              settingsTab: {},
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });

    it('should catch a sibling that is still waiting to be validated', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            settingsTab: {},
          }),
          remainingFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: SIBLING_UNIVERSAL_IDENTIFIER,
              settingsTab: {},
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });

    it('should ignore a component of another application', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            settingsTab: {},
          }),
          optimisticFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: SIBLING_UNIVERSAL_IDENTIFIER,
              applicationUniversalIdentifier:
                OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
              settingsTab: {},
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).not.toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });

    it('should ignore the component being validated found in the maps', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
            settingsTab: {},
          }),
          optimisticFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
              settingsTab: {},
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).not.toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });

    it('should leave a component that is not a settings tab alone', () => {
      const validationResult = service.validateFlatFrontComponentCreation(
        buildCreationArgs({
          flatFrontComponent: buildFlatFrontComponent({
            universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          }),
          optimisticFlatFrontComponents: [
            buildFlatFrontComponent({
              universalIdentifier: SIBLING_UNIVERSAL_IDENTIFIER,
              settingsTab: {},
            }),
          ],
        }),
      );

      expect(getErrorMessages(validationResult)).not.toContain(
        DEFAULT_TAB_COLLISION_MESSAGE,
      );
    });
  });
});
