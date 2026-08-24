import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  '11111111-1111-4111-8111-111111111111';
const COMMAND_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';

const buildCreationArgs = ({
  navigationTargetObjectMetadataUniversalIdentifier,
  knownObjectUniversalIdentifiers = [COMPANY_OBJECT_UNIVERSAL_IDENTIFIER],
}: {
  navigationTargetObjectMetadataUniversalIdentifier: string | null;
  knownObjectUniversalIdentifiers?: string[];
}) =>
  ({
    flatEntityToValidate: {
      universalIdentifier: COMMAND_UNIVERSAL_IDENTIFIER,
      label: 'Go to Companies',
      engineComponentKey: EngineComponentKey.NAVIGATION,
      workflowVersionId: null,
      frontComponentUniversalIdentifier: null,
      payload: { objectMetadataItemId: 'company-object-id' },
      navigationTargetObjectMetadataUniversalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          knownObjectUniversalIdentifiers.map((universalIdentifier) => [
            universalIdentifier,
            { universalIdentifier },
          ]),
        ),
      },
    },
  }) as unknown as Parameters<
    FlatCommandMenuItemValidatorService['validateFlatCommandMenuItemCreation']
  >[0];

describe('FlatCommandMenuItemValidatorService', () => {
  const service = new FlatCommandMenuItemValidatorService();

  it('accepts a navigation command whose target object is in the maps', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        navigationTargetObjectMetadataUniversalIdentifier:
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(result.errors).toEqual([]);
  });

  // A failed object creation leaves its navigation command pointing at nothing,
  // which used to throw while the optimistic maps were mutated and surface as a 500
  it('rejects a navigation command whose target object is missing', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        navigationTargetObjectMetadataUniversalIdentifier:
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        knownObjectUniversalIdentifiers: [],
      }),
    );

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
        message: 'Navigation target object metadata not found',
      }),
    ]);
  });

  it('does not constrain a path based navigation command, which carries no target', () => {
    const result = service.validateFlatCommandMenuItemCreation(
      buildCreationArgs({
        navigationTargetObjectMetadataUniversalIdentifier: null,
        knownObjectUniversalIdentifiers: [],
      }),
    );

    expect(result.errors).toEqual([]);
  });
});
