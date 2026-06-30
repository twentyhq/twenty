import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const createMaps = (): FlatEntityMaps<SyncableFlatEntity> =>
  createEmptyFlatEntityMaps();

const makeFlatEntity = (
  id: string,
  universalIdentifier: string,
  applicationId?: string,
): SyncableFlatEntity =>
  ({
    id,
    universalIdentifier,
    applicationId,
  }) as unknown as SyncableFlatEntity;

describe('addFlatEntityToFlatEntityMapsThroughMutationOrThrow', () => {
  it('should index a new entity by universalIdentifier and id', () => {
    const flatEntityMapsToMutate = createMaps();
    const flatEntity = makeFlatEntity('id-1', 'uid-1', 'app-1');

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMapsToMutate,
    });

    expect(flatEntityMapsToMutate.byUniversalIdentifier['uid-1']).toBe(
      flatEntity,
    );
    expect(flatEntityMapsToMutate.universalIdentifierById['id-1']).toBe(
      'uid-1',
    );
    expect(
      flatEntityMapsToMutate.universalIdentifiersByApplicationId['app-1'],
    ).toEqual(['uid-1']);
  });

  it('should append entities that share an applicationId without duplicating', () => {
    const flatEntityMapsToMutate = createMaps();

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: makeFlatEntity('id-1', 'uid-1', 'app-1'),
      flatEntityMapsToMutate,
    });
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: makeFlatEntity('id-2', 'uid-2', 'app-1'),
      flatEntityMapsToMutate,
    });

    const universalIdentifiers =
      flatEntityMapsToMutate.universalIdentifiersByApplicationId['app-1'];

    expect(universalIdentifiers).toEqual(['uid-1', 'uid-2']);
    expect(new Set(universalIdentifiers).size).toBe(
      universalIdentifiers?.length,
    );
  });

  it('should not index entities that have no applicationId', () => {
    const flatEntityMapsToMutate = createMaps();

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: makeFlatEntity('id-1', 'uid-1'),
      flatEntityMapsToMutate,
    });

    expect(flatEntityMapsToMutate.universalIdentifiersByApplicationId).toEqual(
      {},
    );
  });

  it('should throw when the universalIdentifier already exists', () => {
    const flatEntityMapsToMutate = createMaps();

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: makeFlatEntity('id-1', 'uid-1', 'app-1'),
      flatEntityMapsToMutate,
    });

    expect(() =>
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: makeFlatEntity('id-1-bis', 'uid-1', 'app-1'),
        flatEntityMapsToMutate,
      }),
    ).toThrow(
      expect.objectContaining({
        code: FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      }),
    );
  });

  it('should retain every identifier when many entities share an applicationId', () => {
    const flatEntityMapsToMutate = createMaps();
    const entityCount = 20_000;

    for (let index = 0; index < entityCount; index++) {
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: makeFlatEntity(`id-${index}`, `uid-${index}`, 'app-1'),
        flatEntityMapsToMutate,
      });
    }

    expect(
      flatEntityMapsToMutate.universalIdentifiersByApplicationId['app-1'],
    ).toHaveLength(entityCount);
  });
});
