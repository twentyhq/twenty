import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  '11111111-1111-4111-8111-111111111111';
const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  '22222222-2222-4222-8222-222222222222';
const EXISTING_COMMAND_UNIVERSAL_IDENTIFIER =
  '33333333-3333-4333-8333-333333333333';
const NEW_COMMAND_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';

const buildFlatCommandMenuItem = ({
  universalIdentifier,
  targetObjectMetadataUniversalIdentifier,
}: {
  universalIdentifier: string;
  targetObjectMetadataUniversalIdentifier: string | null;
}) => ({
  universalIdentifier,
  label: 'Go to Companies',
  engineComponentKey: EngineComponentKey.NAVIGATION,
  workflowVersionId: null,
  frontComponentUniversalIdentifier: null,
  payload: { objectMetadataItemId: 'company-object-id' },
  targetObjectMetadataUniversalIdentifier,
});

const buildCreationArgs = ({
  targetObjectMetadataUniversalIdentifier,
  existingCommandMenuItems = [],
}: {
  targetObjectMetadataUniversalIdentifier: string | null;
  existingCommandMenuItems?: ReturnType<typeof buildFlatCommandMenuItem>[];
}) =>
  ({
    flatEntityToValidate: buildFlatCommandMenuItem({
      universalIdentifier: NEW_COMMAND_UNIVERSAL_IDENTIFIER,
      targetObjectMetadataUniversalIdentifier,
    }),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          existingCommandMenuItems.map((item) => [
            item.universalIdentifier,
            item,
          ]),
        ),
      },
    },
  }) as unknown as Parameters<
    FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemCreation']
  >[0];

describe('FlatCommandMenuItemValidatorService', () => {
  const service = new FlatCommandMenuItemValidatorService();

  it('rejects a second navigation command targeting an already claimed object', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        targetObjectMetadataUniversalIdentifier:
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        existingCommandMenuItems: [
          buildFlatCommandMenuItem({
            universalIdentifier: EXISTING_COMMAND_UNIVERSAL_IDENTIFIER,
            targetObjectMetadataUniversalIdentifier:
              COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
          }),
        ],
      }),
    );

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: 'A navigation command menu item already targets this object',
      }),
    ]);
  });

  it('accepts a navigation command targeting a free object', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        targetObjectMetadataUniversalIdentifier:
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        existingCommandMenuItems: [
          buildFlatCommandMenuItem({
            universalIdentifier: EXISTING_COMMAND_UNIVERSAL_IDENTIFIER,
            targetObjectMetadataUniversalIdentifier:
              PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
          }),
        ],
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('does not constrain path based navigation commands, which carry no target', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        targetObjectMetadataUniversalIdentifier: null,
        existingCommandMenuItems: [
          buildFlatCommandMenuItem({
            universalIdentifier: EXISTING_COMMAND_UNIVERSAL_IDENTIFIER,
            targetObjectMetadataUniversalIdentifier: null,
          }),
        ],
      }),
    );

    expect(result.errors).toEqual([]);
  });
});
