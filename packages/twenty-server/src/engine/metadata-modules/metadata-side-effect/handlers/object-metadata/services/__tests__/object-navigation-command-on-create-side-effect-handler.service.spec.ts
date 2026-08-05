import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { ObjectNavigationCommandOnCreateSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/services/object-navigation-command-on-create-side-effect-handler.service';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const OBJECT_ID = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const OTHER_OBJECT_ID = 'c1c2c3c4-c5c6-4000-8000-000000000002';

const DERIVED_UNIVERSAL_IDENTIFIER = getNavigationCommandUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
});

type ObjectMetadataOverrides = Partial<{
  id: string | undefined;
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  isActive: boolean;
  nameSingular: string;
  shortcut: string | null;
}>;

const buildFlatObjectMetadata = (overrides: ObjectMetadataOverrides = {}) => ({
  id: OBJECT_ID,
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  isActive: true,
  nameSingular: 'ticket',
  shortcut: 'T',
  ...overrides,
});

const buildArgs = ({
  flatObjectMetadata = buildFlatObjectMetadata(),
  otherFlatObjectMetadatasInBatch = [],
  pendingFlatCommandMenuItems = [],
  syncedFlatCommandMenuItems = [],
}: {
  flatObjectMetadata?: ReturnType<typeof buildFlatObjectMetadata>;
  otherFlatObjectMetadatasInBatch?: ReturnType<
    typeof buildFlatObjectMetadata
  >[];
  pendingFlatCommandMenuItems?: object[];
  syncedFlatCommandMenuItems?: {
    universalIdentifier: string;
    position: number;
  }[];
} = {}): BuildSideEffectsArgs<'objectMetadata'> =>
  ({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      objectMetadata: {
        flatEntityToCreate: Object.fromEntries(
          [flatObjectMetadata, ...otherFlatObjectMetadatasInBatch].map(
            (batchFlatObjectMetadata) => [
              batchFlatObjectMetadata.universalIdentifier,
              batchFlatObjectMetadata,
            ],
          ),
        ),
        flatEntityToUpdate: {},
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
      flatCommandMenuItemMaps: {
        byUniversalIdentifier: Object.fromEntries(
          syncedFlatCommandMenuItems.map((syncedFlatCommandMenuItem) => [
            syncedFlatCommandMenuItem.universalIdentifier,
            syncedFlatCommandMenuItem,
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'objectMetadata'>;

describe('ObjectNavigationCommandOnCreateSideEffectHandlerService', () => {
  const handler =
    new (ObjectNavigationCommandOnCreateSideEffectHandlerService as unknown as new () => ObjectNavigationCommandOnCreateSideEffectHandlerService)();

  const expectSuccess = (
    result: ReturnType<typeof handler.buildSideEffects>,
  ) => {
    if (result.status !== 'success') {
      throw new Error(`expected success, got ${result.status}`);
    }

    return result;
  };

  it('provisions the navigation command with the derived (application, object) identifier and denormalized fields', () => {
    const result = expectSuccess(handler.buildSideEffects(buildArgs()));

    const created = Object.values(
      result.operations.commandMenuItem?.flatEntityToCreate ?? {},
    );

    expect(created).toHaveLength(1);

    const [navigationCommand] = created as unknown as [
      {
        universalIdentifier: string;
        applicationUniversalIdentifier: string;
        engineComponentKey: EngineComponentKey;
        payload: unknown;
        hotKeys: string[] | null;
        conditionalAvailabilityExpression: string | null;
        isSystemSideEffect: boolean;
        position: number;
      },
    ];

    expect(navigationCommand.universalIdentifier).toBe(
      DERIVED_UNIVERSAL_IDENTIFIER,
    );
    expect(navigationCommand.applicationUniversalIdentifier).toBe(
      APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    expect(navigationCommand.engineComponentKey).toBe(
      EngineComponentKey.NAVIGATION,
    );
    expect(navigationCommand.payload).toEqual({
      objectMetadataItemId: OBJECT_ID,
    });
    expect(navigationCommand.hotKeys).toEqual(['G', 'T']);
    expect(navigationCommand.conditionalAvailabilityExpression).toBe(
      'targetObjectReadPermissions.ticket',
    );
    expect(navigationCommand.isSystemSideEffect).toBe(true);
    expect(navigationCommand.position).toBe(0);
  });

  it('derives the identifier from the owning application, so an app-owned object gets an app-owned command', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          flatObjectMetadata: buildFlatObjectMetadata({
            applicationUniversalIdentifier:
              OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
        }),
      ),
    );

    const [navigationCommand] = Object.values(
      result.operations.commandMenuItem?.flatEntityToCreate ?? {},
    ) as unknown as [{ universalIdentifier: string }];

    expect(navigationCommand.universalIdentifier).toBe(
      getNavigationCommandUniversalIdentifier({
        applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    );
    expect(navigationCommand.universalIdentifier).not.toBe(
      DERIVED_UNIVERSAL_IDENTIFIER,
    );
  });

  it('noops when the object is created inactive', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        flatObjectMetadata: buildFlatObjectMetadata({ isActive: false }),
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('noops when the object create carries no workspace id (manifest sync path)', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        flatObjectMetadata: buildFlatObjectMetadata({ id: undefined }),
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('noops when a synced navigation command already targets the object, whatever its identifier', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        syncedFlatCommandMenuItems: [
          {
            universalIdentifier: 'legacy-v5-derived-identifier',
            position: 3,
            engineComponentKey: EngineComponentKey.NAVIGATION,
            payload: { objectMetadataItemId: OBJECT_ID },
          } as never,
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('noops when a pending command menu item create already targets the object', () => {
    const result = handler.buildSideEffects(
      buildArgs({
        pendingFlatCommandMenuItems: [
          {
            universalIdentifier: 'manifest-authored-identifier',
            engineComponentKey: EngineComponentKey.NAVIGATION,
            payload: { objectMetadataItemId: OBJECT_ID },
          },
        ],
      }),
    );

    expect(result.status).toBe('noop');
  });

  it('does not treat path-based NAVIGATION commands or other-object commands as duplicates', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          syncedFlatCommandMenuItems: [
            {
              universalIdentifier: 'go-to-settings-identifier',
              position: 4,
              engineComponentKey: EngineComponentKey.NAVIGATION,
              payload: { path: '/settings/profile' },
            } as never,
            {
              universalIdentifier: 'other-object-navigation-identifier',
              position: 5,
              engineComponentKey: EngineComponentKey.NAVIGATION,
              payload: { objectMetadataItemId: OTHER_OBJECT_ID },
            } as never,
          ],
        }),
      ),
    );

    expect(
      Object.keys(result.operations.commandMenuItem?.flatEntityToCreate ?? {}),
    ).toEqual([DERIVED_UNIVERSAL_IDENTIFIER]);
  });

  it('appends after the synced maximum position', () => {
    const result = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          syncedFlatCommandMenuItems: [
            { universalIdentifier: 'existing-command', position: 41 } as never,
          ],
        }),
      ),
    );

    const [navigationCommand] = Object.values(
      result.operations.commandMenuItem?.flatEntityToCreate ?? {},
    ) as unknown as [{ position: number }];

    expect(navigationCommand.position).toBe(42);
  });

  it('derives distinct deterministic positions for objects created in the same batch', () => {
    const firstFlatObjectMetadata = buildFlatObjectMetadata();
    const secondFlatObjectMetadata = buildFlatObjectMetadata({
      id: OTHER_OBJECT_ID,
      universalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
      nameSingular: 'invoice',
      shortcut: null,
    });

    const firstResult = expectSuccess(
      handler.buildSideEffects(
        buildArgs({
          flatObjectMetadata: firstFlatObjectMetadata,
          otherFlatObjectMetadatasInBatch: [secondFlatObjectMetadata],
        }),
      ),
    );
    const secondResult = expectSuccess(
      handler.buildSideEffects({
        ...buildArgs({
          flatObjectMetadata: firstFlatObjectMetadata,
          otherFlatObjectMetadatasInBatch: [secondFlatObjectMetadata],
        }),
        flatEntity:
          secondFlatObjectMetadata as unknown as BuildSideEffectsArgs<'objectMetadata'>['flatEntity'],
      }),
    );

    const [firstNavigationCommand] = Object.values(
      firstResult.operations.commandMenuItem?.flatEntityToCreate ?? {},
    ) as unknown as [{ position: number }];
    const [secondNavigationCommand] = Object.values(
      secondResult.operations.commandMenuItem?.flatEntityToCreate ?? {},
    ) as unknown as [{ position: number }];

    expect(firstNavigationCommand.position).toBe(0);
    expect(secondNavigationCommand.position).toBe(1);
  });
});
