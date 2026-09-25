import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildObjectNavigationUniversalFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

type CreationArgs = Parameters<
  FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemCreation']
>[0];

type UpdateArgs = Parameters<
  FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemUpdate']
>[0];

const buildCommand = (
  overrides: Partial<CreationArgs['flatEntityToValidate']> = {},
) => ({
  ...buildObjectNavigationUniversalFlatCommandMenuItem({
    objectMetadata: {
      id: 'object-id',
      universalIdentifier: 'object-identifier',
      nameSingular: 'person',
      shortcut: null,
      isActive: true,
    },
    applicationUniversalIdentifier: '11111111-1111-4111-8111-111111111111',
    position: 0,
    now: '2026-09-16T00:00:00Z',
  }),
  engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  ...overrides,
});

const buildArgs = (
  overrides: Partial<CreationArgs['flatEntityToValidate']> = {},
) =>
  ({
    flatEntityToValidate: buildCommand(overrides),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      flatCommandMenuItemMaps: { byUniversalIdentifier: {} },
    },
  }) as CreationArgs;

describe('workflow command menu validation', () => {
  const service = new FlatCommandMenuItemValidatorService();

  it.each([
    { workflowVersionId: 'workspace-version', coreWorkflowVersionId: null },
    { workflowVersionId: null, coreWorkflowVersionId: 'core-version' },
    {
      workflowVersionId: 'workspace-version',
      coreWorkflowVersionId: 'core-version',
    },
  ])('accepts legacy, core and dual-keyed triggers: %j', (identifiers) => {
    expect(
      service.validateFlatCommandMenuItemCreation(buildArgs(identifiers))
        .errors,
    ).toEqual([]);
  });

  it('rejects a trigger without a definition ID', () => {
    expect(
      service.validateFlatCommandMenuItemCreation(buildArgs()).errors,
    ).toHaveLength(1);
  });

  it('rejects workflow IDs on unrelated engine commands', () => {
    expect(
      service.validateFlatCommandMenuItemCreation(
        buildArgs({
          engineComponentKey: EngineComponentKey.DELETE_RECORDS,
          coreWorkflowVersionId: 'core-version',
        }),
      ).errors,
    ).toHaveLength(1);
  });

  it('allows renaming an existing core-only trigger', () => {
    const command = buildCommand({ coreWorkflowVersionId: 'core-version' });
    const args = {
      universalIdentifier: command.universalIdentifier,
      flatEntityUpdate: { label: 'Renamed' },
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatObjectMetadataMaps: { byUniversalIdentifier: {} },
        flatCommandMenuItemMaps: {
          byUniversalIdentifier: { [command.universalIdentifier]: command },
        },
      },
    } as UpdateArgs;
    expect(service.validateFlatCommandMenuItemUpdate(args).errors).toEqual([]);
  });
});

describe('navigation command menu activation validation', () => {
  const service = new FlatCommandMenuItemValidatorService();

  const buildUpdateArgs = ({
    isObjectActive,
    flatEntityUpdate,
  }: {
    isObjectActive: boolean;
    flatEntityUpdate: UpdateArgs['flatEntityUpdate'];
  }) => {
    const objectMetadata = {
      id: 'object-id',
      universalIdentifier: 'object-identifier',
      applicationUniversalIdentifier: '11111111-1111-4111-8111-111111111111',
      nameSingular: 'person',
      shortcut: null,
      isActive: isObjectActive,
      universalOverrides: null,
    };
    const command = buildObjectNavigationUniversalFlatCommandMenuItem({
      objectMetadata: { ...objectMetadata, isActive: false },
      applicationUniversalIdentifier: '11111111-1111-4111-8111-111111111111',
      position: 0,
      now: '2026-09-16T00:00:00Z',
    });

    return {
      universalIdentifier: command.universalIdentifier,
      flatEntityUpdate,
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
        flatObjectMetadataMaps: {
          byUniversalIdentifier: {
            [objectMetadata.universalIdentifier]: objectMetadata,
          },
        },
        flatCommandMenuItemMaps: {
          byUniversalIdentifier: { [command.universalIdentifier]: command },
        },
      },
    } as unknown as UpdateArgs;
  };

  it('rejects showing a navigation command whose object is inactive', () => {
    expect(
      service.validateFlatCommandMenuItemUpdate(
        buildUpdateArgs({
          isObjectActive: false,
          flatEntityUpdate: { isActive: true },
        }),
      ).errors,
    ).toHaveLength(1);
  });

  it('allows showing a navigation command whose object is active', () => {
    expect(
      service.validateFlatCommandMenuItemUpdate(
        buildUpdateArgs({
          isObjectActive: true,
          flatEntityUpdate: { isActive: true },
        }),
      ).errors,
    ).toEqual([]);
  });

  it('allows other updates on a navigation command whose object is inactive', () => {
    expect(
      service.validateFlatCommandMenuItemUpdate(
        buildUpdateArgs({
          isObjectActive: false,
          flatEntityUpdate: { label: 'Renamed' },
        }),
      ).errors,
    ).toEqual([]);
  });
});
