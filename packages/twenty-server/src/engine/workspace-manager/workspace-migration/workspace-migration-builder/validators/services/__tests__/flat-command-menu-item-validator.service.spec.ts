import { Test, type TestingModule } from '@nestjs/testing';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

const buildFlatCommandMenuItem = (
  overrides: Partial<FlatCommandMenuItem> = {},
): FlatCommandMenuItem =>
  ({
    id: 'command-menu-item-id',
    universalIdentifier: 'command-menu-item-universal-id',
    applicationId: 'application-id',
    applicationUniversalIdentifier: 'application-universal-id',
    workspaceId: 'workspace-id',
    label: 'Command',
    shortLabel: null,
    icon: null,
    position: 1,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression: null,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
    payload: null,
    hotKeys: null,
    workflowVersionId: null,
    availabilityObjectMetadataId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    createdAt: '2026-05-22T00:00:00.000Z',
    updatedAt: '2026-05-22T00:00:00.000Z',
    ...overrides,
  }) as FlatCommandMenuItem;

const buildCreationArgs = (flatEntityToValidate: FlatCommandMenuItem) =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {},
    buildOptions: {},
  }) as unknown as Parameters<
    FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemCreation']
  >[0];

describe('FlatCommandMenuItemValidatorService', () => {
  let service: FlatCommandMenuItemValidatorService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [FlatCommandMenuItemValidatorService],
    }).compile();

    service = moduleRef.get(FlatCommandMenuItemValidatorService);
  });

  it('accepts null payload for CREATE_NEW_RECORD', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs(buildFlatCommandMenuItem({ payload: null })),
    );

    expect(result.errors).toHaveLength(0);
  });

  it('accepts object metadata payload for CREATE_NEW_RECORD', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs(
        buildFlatCommandMenuItem({
          payload: { objectMetadataItemId: 'object-metadata-id' },
        }),
      ),
    );

    expect(result.errors).toHaveLength(0);
  });

  it('rejects path payload for CREATE_NEW_RECORD', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs(
        buildFlatCommandMenuItem({
          payload: { path: '/settings/profile' },
        }),
      ),
    );

    expect(result.errors.map((error) => error.code)).toEqual([
      CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
    ]);
  });

  it('rejects mixed object metadata and path payload for CREATE_NEW_RECORD', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs(
        buildFlatCommandMenuItem({
          payload: {
            objectMetadataItemId: 'object-metadata-id',
            path: '/settings/profile',
          },
        }),
      ),
    );

    expect(result.errors.map((error) => error.code)).toEqual([
      CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
    ]);
  });

  it('still requires payload for NAVIGATION', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs(
        buildFlatCommandMenuItem({
          engineComponentKey: EngineComponentKey.NAVIGATION,
          payload: null,
        }),
      ),
    );

    expect(result.errors.map((error) => error.code)).toEqual([
      CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
    ]);
  });
});
