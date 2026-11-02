import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';
import { validateCommandMenuItemPinLock } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-command-menu-item-pin-lock.util';

const NOW = '2026-10-26T12:00:00.000Z';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-333333333333';

const OWNER_BUILD_OPTIONS = {
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const WORKSPACE_BUILD_OPTIONS = {
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const LOCKED_SAVE_COMMAND: UniversalFlatCommandMenuItem = {
  universalIdentifier: '6b0d3f52-0f4b-4d8e-9a57-2f0c1e5d7a11',
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  label: 'Save',
  shortLabel: 'Save',
  icon: 'IconDeviceFloppy',
  position: 81,
  isPinned: true,
  isPinLocked: true,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.SAVE_PAGE,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression: 'includes(pageCommandKeys, "SAVE_PAGE")',
  conditionalPinnedExpression: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
  pageLayoutUniversalIdentifier: null,
  workflowVersionId: null,
  coreWorkflowVersionId: null,
  hotKeys: null,
  payload: null,
  universalOverrides: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const withWorkspaceOverrides = (
  commandMenuItem: UniversalFlatCommandMenuItem,
  overrides: Record<string, unknown>,
): UniversalFlatCommandMenuItem => ({
  ...commandMenuItem,
  universalOverrides: {
    [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: overrides,
  } as UniversalFlatCommandMenuItem['universalOverrides'],
});

describe('validateCommandMenuItemPinLock', () => {
  it('should refuse a locked command that is not pinned', () => {
    expect(
      validateCommandMenuItemPinLock({
        toFlatCommandMenuItem: { ...LOCKED_SAVE_COMMAND, isPinned: false },
        buildOptions: OWNER_BUILD_OPTIONS,
      }),
    ).toEqual(
      expect.objectContaining({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: 'This command is always pinned',
      }),
    );
  });

  it('should allow a locked command that is pinned', () => {
    expect(
      validateCommandMenuItemPinLock({
        toFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        buildOptions: OWNER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it.each([
    ['unpins it', { isPinned: false }],
    ['deactivates it', { isActive: false }],
    [
      'changes its engine component key',
      { engineComponentKey: EngineComponentKey.CANCEL_PAGE },
    ],
    [
      'changes its availability type',
      { availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION },
    ],
    [
      'scopes it to an object',
      {
        availabilityObjectMetadataUniversalIdentifier:
          '0a9e2b1c-5d4f-4e3a-8b7c-6d5e4f3a2b1c',
      },
    ],
    [
      'scopes it to a page layout',
      { pageLayoutUniversalIdentifier: '1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e' },
    ],
  ])('should refuse a workspace override that %s', (_, workspaceOverrides) => {
    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        toFlatCommandMenuItem: withWorkspaceOverrides(
          LOCKED_SAVE_COMMAND,
          workspaceOverrides,
        ),
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeDefined();
  });

  it('should allow a workspace override that only moves a locked command', () => {
    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        toFlatCommandMenuItem: withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
          isPinned: true,
          position: 3,
        }),
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow a workspace that already unpinned a command before it was locked to keep moving it', () => {
    const unpinnedSaveCommand = withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
      isPinned: false,
    });

    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: unpinnedSaveCommand,
        toFlatCommandMenuItem: withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
          isPinned: false,
          position: 3,
        }),
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow a workspace to hide a locked command it already unpinned', () => {
    const unpinnedSaveCommand = withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
      isPinned: false,
    });

    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: unpinnedSaveCommand,
        toFlatCommandMenuItem: withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
          isPinned: false,
          isActive: false,
        }),
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow the owner to lock a command a workspace already unpinned', () => {
    const unpinnedSaveCommand = {
      ...LOCKED_SAVE_COMMAND,
      isPinLocked: false,
      isPinned: false,
    };

    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: unpinnedSaveCommand,
        toFlatCommandMenuItem: { ...unpinnedSaveCommand, isPinLocked: true },
        buildOptions: OWNER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow a workspace to reset its overrides on a locked command', () => {
    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: withWorkspaceOverrides(LOCKED_SAVE_COMMAND, {
          isPinned: false,
        }),
        toFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow the owner to unlock and unpin its command', () => {
    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        toFlatCommandMenuItem: {
          ...LOCKED_SAVE_COMMAND,
          isPinLocked: false,
          isPinned: false,
        },
        buildOptions: OWNER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow the owner to deactivate its locked command', () => {
    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: LOCKED_SAVE_COMMAND,
        toFlatCommandMenuItem: { ...LOCKED_SAVE_COMMAND, isActive: false },
        buildOptions: OWNER_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });

  it('should allow a workspace to unpin a command that is not locked', () => {
    const unlockedSaveCommand = { ...LOCKED_SAVE_COMMAND, isPinLocked: false };

    expect(
      validateCommandMenuItemPinLock({
        fromFlatCommandMenuItem: unlockedSaveCommand,
        toFlatCommandMenuItem: withWorkspaceOverrides(unlockedSaveCommand, {
          isPinned: false,
        }),
        buildOptions: WORKSPACE_BUILD_OPTIONS,
      }),
    ).toBeUndefined();
  });
});
