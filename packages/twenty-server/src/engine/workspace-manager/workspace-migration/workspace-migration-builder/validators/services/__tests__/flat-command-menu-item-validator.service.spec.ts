import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

const OBJECT_ID = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const OTHER_OBJECT_ID = 'c1c2c3c4-c5c6-4000-8000-000000000002';

const buildFlatCommandMenuItem = (
  overrides: Partial<{
    universalIdentifier: string;
    label: string;
    engineComponentKey: EngineComponentKey | null;
    payload: object | null;
    isSystemSideEffect: boolean;
    workflowVersionId: string | null;
    frontComponentUniversalIdentifier: string | null;
  }> = {},
) => ({
  universalIdentifier: 'command-menu-item-identifier',
  label: 'Go to ${navigateToObjectMetadataItem.labelPlural}',
  engineComponentKey: EngineComponentKey.NAVIGATION,
  payload: { objectMetadataItemId: OBJECT_ID },
  isSystemSideEffect: true,
  workflowVersionId: null,
  frontComponentUniversalIdentifier: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  ...overrides,
});

const buildValidationArgs = ({
  flatEntityToValidate,
  existingFlatCommandMenuItems = [],
}: {
  flatEntityToValidate: ReturnType<typeof buildFlatCommandMenuItem>;
  existingFlatCommandMenuItems?: ReturnType<typeof buildFlatCommandMenuItem>[];
}) =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          existingFlatCommandMenuItems.map((existingFlatCommandMenuItem) => [
            existingFlatCommandMenuItem.universalIdentifier,
            existingFlatCommandMenuItem,
          ]),
        ),
      },
    },
    additionalCacheDataMaps: {},
    workspaceId: 'workspace-id',
    remainingFlatEntityMapsToValidate: { byUniversalIdentifier: {} },
    buildOptions: {},
  }) as unknown as Parameters<
    FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemCreation']
  >[0];

describe('FlatCommandMenuItemValidatorService', () => {
  const validator = new FlatCommandMenuItemValidatorService();

  describe('validateFlatCommandMenuItemCreation', () => {
    it('accepts an engine-owned object navigation command with no competitor', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem(),
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('rejects a non-system object navigation command', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem({
            isSystemSideEffect: false,
          }),
        }),
      );

      expect(result.errors).toEqual([
        expect.objectContaining({
          code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
        }),
      ]);
    });

    it('rejects a second navigation command for the same object', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem(),
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'other-command-menu-item-identifier',
            }),
          ],
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'already has a navigation command',
      );
    });

    it('accepts a navigation command when the existing ones target other objects', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem(),
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'other-command-menu-item-identifier',
              payload: { objectMetadataItemId: OTHER_OBJECT_ID },
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('does not catch path-based NAVIGATION commands', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem({
            universalIdentifier: 'go-to-settings-identifier',
            payload: { path: '/settings/profile' },
            isSystemSideEffect: false,
          }),
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'other-path-identifier',
              payload: { path: '/settings/experience' },
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('rejects a non-system row claiming a universal identifier held by a system row', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem({
            universalIdentifier: 'standard-action-command-identifier',
            engineComponentKey: EngineComponentKey.DELETE_RECORDS,
            payload: null,
            isSystemSideEffect: false,
          }),
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'standard-action-command-identifier',
              engineComponentKey: EngineComponentKey.DELETE_RECORDS,
              payload: null,
              isSystemSideEffect: true,
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([
        expect.objectContaining({
          code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
        }),
      ]);
    });

    it('accepts a non-system row claiming a universal identifier held by a non-system row', () => {
      const result = validator.validateFlatCommandMenuItemCreation(
        buildValidationArgs({
          flatEntityToValidate: buildFlatCommandMenuItem({
            universalIdentifier: 'app-authored-identifier',
            engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
            payload: null,
            isSystemSideEffect: false,
            frontComponentUniversalIdentifier: 'front-component-identifier',
          }),
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'app-authored-identifier',
              engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
              payload: null,
              isSystemSideEffect: false,
              frontComponentUniversalIdentifier: 'front-component-identifier',
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });

  describe('validateFlatCommandMenuItemUpdate', () => {
    const buildUpdateArgs = ({
      universalIdentifier,
      flatEntityUpdate,
      existingFlatCommandMenuItems,
    }: {
      universalIdentifier: string;
      flatEntityUpdate: object;
      existingFlatCommandMenuItems: ReturnType<
        typeof buildFlatCommandMenuItem
      >[];
    }) =>
      ({
        universalIdentifier,
        flatEntityUpdate,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatCommandMenuItemMaps: {
            byUniversalIdentifier: Object.fromEntries(
              existingFlatCommandMenuItems.map(
                (existingFlatCommandMenuItem) => [
                  existingFlatCommandMenuItem.universalIdentifier,
                  existingFlatCommandMenuItem,
                ],
              ),
            ),
          },
        },
        additionalCacheDataMaps: {},
        workspaceId: 'workspace-id',
        buildOptions: {},
      }) as unknown as Parameters<
        FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemUpdate']
      >[0];

    it('tolerates an isActive follow on a legacy-identifier navigation command', () => {
      const result = validator.validateFlatCommandMenuItemUpdate(
        buildUpdateArgs({
          universalIdentifier: 'legacy-navigation-identifier',
          flatEntityUpdate: { isActive: false },
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'legacy-navigation-identifier',
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('rejects an update retargeting a row onto an object that already has a navigation command', () => {
      const result = validator.validateFlatCommandMenuItemUpdate(
        buildUpdateArgs({
          universalIdentifier: 'retargeted-identifier',
          flatEntityUpdate: { payload: { objectMetadataItemId: OBJECT_ID } },
          existingFlatCommandMenuItems: [
            buildFlatCommandMenuItem({
              universalIdentifier: 'retargeted-identifier',
              payload: { path: '/settings/profile' },
            }),
            buildFlatCommandMenuItem({
              universalIdentifier: 'existing-navigation-identifier',
            }),
          ],
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain(
        'already has a navigation command',
      );
    });
  });
});
