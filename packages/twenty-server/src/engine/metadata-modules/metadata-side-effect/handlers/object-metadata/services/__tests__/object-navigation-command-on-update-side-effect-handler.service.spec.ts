import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectNavigationCommandOnUpdateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-command-on-update-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OBJECT_ID = 'c1c2c3c4-c5c6-4000-8000-000000000001';

const DERIVED_UNIVERSAL_IDENTIFIER = getNavigationCommandUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
});
const LEGACY_UNIVERSAL_IDENTIFIER = 'legacy-v5-derived-identifier';

const buildFlatObjectMetadata = (
  overrides: Partial<{
    isActive: boolean;
    nameSingular: string;
    shortcut: string | null;
  }> = {},
) => ({
  id: OBJECT_ID,
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  isActive: true,
  nameSingular: 'ticket',
  shortcut: 'T',
  ...overrides,
});

const buildNavigationCommand = (
  overrides: Partial<{
    universalIdentifier: string;
    isActive: boolean;
    conditionalAvailabilityExpression: string;
    hotKeys: string[] | null;
    payload: object;
  }> = {},
) => ({
  universalIdentifier: DERIVED_UNIVERSAL_IDENTIFIER,
  engineComponentKey: EngineComponentKey.NAVIGATION,
  payload: { objectMetadataItemId: OBJECT_ID },
  isActive: true,
  conditionalAvailabilityExpression: 'targetObjectReadPermissions.ticket',
  hotKeys: ['G', 'T'],
  position: 7,
  ...overrides,
});

const buildArgs = ({
  updatedFlatObjectMetadata,
  existingFlatObjectMetadata = buildFlatObjectMetadata(),
  syncedFlatCommandMenuItems = [],
  pendingFlatCommandMenuItems = [],
}: {
  updatedFlatObjectMetadata: ReturnType<typeof buildFlatObjectMetadata>;
  existingFlatObjectMetadata?: ReturnType<typeof buildFlatObjectMetadata>;
  syncedFlatCommandMenuItems?: object[];
  pendingFlatCommandMenuItems?: object[];
}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: updatedFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {
          [updatedFlatObjectMetadata.universalIdentifier]:
            updatedFlatObjectMetadata,
        },
        flatEntityToDelete: {},
      },
      ...(pendingFlatCommandMenuItems.length > 0 && {
        commandMenuItem: {
          flatEntityToCreate: Object.fromEntries(
            pendingFlatCommandMenuItems.map((pendingFlatCommandMenuItem) => [
              (pendingFlatCommandMenuItem as { universalIdentifier: string })
                .universalIdentifier,
              pendingFlatCommandMenuItem,
            ]),
          ),
          flatEntityToUpdate: {},
          flatEntityToDelete: {},
        },
      }),
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [existingFlatObjectMetadata.universalIdentifier]:
            existingFlatObjectMetadata,
        },
      },
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          syncedFlatCommandMenuItems.map((syncedFlatCommandMenuItem) => [
            (syncedFlatCommandMenuItem as { universalIdentifier: string })
              .universalIdentifier,
            syncedFlatCommandMenuItem,
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectNavigationCommandOnUpdateSideEffectHandlerService', () => {
  const handler =
    new (ObjectNavigationCommandOnUpdateSideEffectHandlerService as unknown as new () => ObjectNavigationCommandOnUpdateSideEffectHandlerService)();

  const expectSuccess = (
    result: ReturnType<typeof handler.buildSideEffects>,
  ) => {
    if (result.status !== 'success') {
      throw new Error(`expected success, got ${result.status}`);
    }

    return result;
  };

  it('noops when none of isActive, nameSingular or shortcut changed', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: buildFlatObjectMetadata(),
        syncedFlatCommandMenuItems: [buildNavigationCommand()],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('soft-disables the command when the object is deactivated', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            isActive: false,
          }),
          syncedFlatCommandMenuItems: [buildNavigationCommand()],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(Object.keys(updated)).toEqual([DERIVED_UNIVERSAL_IDENTIFIER]);
    expect(
      (updated[DERIVED_UNIVERSAL_IDENTIFIER] as { isActive: boolean }).isActive,
    ).toBe(false);
  });

  it('reactivates the command when the object is enabled', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata(),
          existingFlatObjectMetadata: buildFlatObjectMetadata({
            isActive: false,
          }),
          syncedFlatCommandMenuItems: [
            buildNavigationCommand({ isActive: false }),
          ],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(
      (updated[DERIVED_UNIVERSAL_IDENTIFIER] as { isActive: boolean }).isActive,
    ).toBe(true);
  });

  it('recomputes conditionalAvailabilityExpression when nameSingular changes, keeping the identifier', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            nameSingular: 'renamedTicket',
          }),
          syncedFlatCommandMenuItems: [buildNavigationCommand()],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(Object.keys(updated)).toEqual([DERIVED_UNIVERSAL_IDENTIFIER]);
    expect(
      (
        updated[DERIVED_UNIVERSAL_IDENTIFIER] as {
          conditionalAvailabilityExpression: string;
        }
      ).conditionalAvailabilityExpression,
    ).toBe('targetObjectReadPermissions.renamedTicket');
  });

  it('recomputes hotKeys when the shortcut changes', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            shortcut: 'K',
          }),
          syncedFlatCommandMenuItems: [buildNavigationCommand()],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(
      (updated[DERIVED_UNIVERSAL_IDENTIFIER] as { hotKeys: string[] | null })
        .hotKeys,
    ).toEqual(['G', 'K']);
  });

  it('clears hotKeys when the shortcut is removed', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            shortcut: null,
          }),
          syncedFlatCommandMenuItems: [buildNavigationCommand()],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(
      (updated[DERIVED_UNIVERSAL_IDENTIFIER] as { hotKeys: string[] | null })
        .hotKeys,
    ).toBeNull();
  });

  it('follows a command still holding a legacy identifier, resolved by payload target', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata({
            isActive: false,
          }),
          syncedFlatCommandMenuItems: [
            buildNavigationCommand({
              universalIdentifier: LEGACY_UNIVERSAL_IDENTIFIER,
            }),
          ],
        }),
      ),
    );

    const updated = result.operations.commandMenuItem?.flatEntityToUpdate ?? {};

    expect(Object.keys(updated)).toEqual([LEGACY_UNIVERSAL_IDENTIFIER]);
  });

  it('provisions a command when enabling an object that has none', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          updatedFlatObjectMetadata: buildFlatObjectMetadata(),
          existingFlatObjectMetadata: buildFlatObjectMetadata({
            isActive: false,
          }),
          syncedFlatCommandMenuItems: [],
        }),
      ),
    );

    const created = result.operations.commandMenuItem?.flatEntityToCreate ?? {};

    expect(Object.keys(created)).toEqual([DERIVED_UNIVERSAL_IDENTIFIER]);
    expect(
      (created[DERIVED_UNIVERSAL_IDENTIFIER] as { payload: unknown }).payload,
    ).toEqual({ objectMetadataItemId: OBJECT_ID });
  });

  it('noops instead of creating when a pending create already targets the enabled object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        updatedFlatObjectMetadata: buildFlatObjectMetadata(),
        existingFlatObjectMetadata: buildFlatObjectMetadata({
          isActive: false,
        }),
        pendingFlatCommandMenuItems: [
          {
            universalIdentifier: 'pending-identifier',
            engineComponentKey: EngineComponentKey.NAVIGATION,
            payload: { objectMetadataItemId: OBJECT_ID },
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('fails when the existing object cannot be resolved', () => {
    const args = buildArgs({
      updatedFlatObjectMetadata: buildFlatObjectMetadata({ isActive: false }),
    });

    (
      args.relatedFlatEntityMaps as unknown as {
        flatObjectMetadataMaps: { byUniversalIdentifier: object };
      }
    ).flatObjectMetadataMaps.byUniversalIdentifier = {};

    const result = handler.buildSideEffects(args);

    expect(result.status).toBe('fail');
  });
});
