import { v4 as uuidv4 } from 'uuid';

import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { topologicallySortUniversalFlatEntitiesForSelfReferentialFks } from 'src/engine/workspace-manager/workspace-migration/utils/topologically-sort-universal-flat-entities-for-self-referential-fks.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();

type TestNavigationMenuItemEntity = {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  folderUniversalIdentifier: string | null;
};

const createEntity = (
  universalIdentifier: string,
  folderUniversalIdentifier: string | null = null,
): TestNavigationMenuItemEntity => ({
  universalIdentifier,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier,
});

const buildMaps = (
  entities: TestNavigationMenuItemEntity[],
): UniversalFlatEntityMaps<TestNavigationMenuItemEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

describe('topologicallySortUniversalFlatEntitiesForSelfReferentialFks', () => {
  it('returns empty array for empty maps', () => {
    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([]) as never,
    });

    expect(result).toEqual([]);
  });

  it('returns original order for entities without self-referential FKs', () => {
    const idA = uuidv4();
    const idB = uuidv4();

    const maps = {
      byUniversalIdentifier: {
        [idA]: {
          universalIdentifier: idA,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        [idB]: {
          universalIdentifier: idB,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      },
    };

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'objectMetadata',
      universalFlatEntityMaps: maps as never,
    });

    expect(result).toEqual([idA, idB]);
  });

  it('returns original order when no entity references another in the batch', () => {
    const itemA = uuidv4();
    const itemB = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(itemA),
        createEntity(itemB),
      ]) as never,
    });

    expect(result).toEqual([itemA, itemB]);
  });

  it('sorts parent before child when child is listed first', () => {
    const parentId = uuidv4();
    const childId = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(childId, parentId),
        createEntity(parentId),
      ]) as never,
    });

    expect(result).toEqual([parentId, childId]);
  });

  it('keeps parent before child when already in correct order', () => {
    const parentId = uuidv4();
    const childId = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(parentId),
        createEntity(childId, parentId),
      ]) as never,
    });

    expect(result).toEqual([parentId, childId]);
  });

  it('sorts multi-level hierarchy: grandparent -> parent -> child', () => {
    const grandparentId = uuidv4();
    const parentId = uuidv4();
    const childId = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(childId, parentId),
        createEntity(grandparentId),
        createEntity(parentId, grandparentId),
      ]) as never,
    });

    expect(result).toEqual([grandparentId, parentId, childId]);
  });

  it('handles multiple roots with children', () => {
    const rootA = uuidv4();
    const rootB = uuidv4();
    const childA = uuidv4();
    const childB = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(childB, rootB),
        createEntity(childA, rootA),
        createEntity(rootA),
        createEntity(rootB),
      ]) as never,
    });

    expect(result.indexOf(rootA)).toBeLessThan(result.indexOf(childA));
    expect(result.indexOf(rootB)).toBeLessThan(result.indexOf(childB));
    expect(result).toHaveLength(4);
  });

  it('ignores references to entities outside the batch', () => {
    const externalParentId = uuidv4();
    const itemA = uuidv4();
    const itemB = uuidv4();

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'navigationMenuItem',
      universalFlatEntityMaps: buildMaps([
        createEntity(itemA, externalParentId),
        createEntity(itemB),
      ]) as never,
    });

    expect(result).toEqual([itemA, itemB]);
  });

  it('throws on cycles for entities without expected cycles', () => {
    const idA = uuidv4();
    const idB = uuidv4();

    expect(() =>
      topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
        metadataName: 'navigationMenuItem',
        universalFlatEntityMaps: buildMaps([
          createEntity(idA, idB),
          createEntity(idB, idA),
        ]) as never,
      }),
    ).toThrow(/Cyclic self-referential foreign key detected/);
  });

  it('appends cyclic entities for fieldMetadata (expected bidirectional cycles)', () => {
    const idA = uuidv4();
    const idB = uuidv4();

    const maps = {
      byUniversalIdentifier: {
        [idA]: {
          universalIdentifier: idA,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          relationTargetFieldMetadataUniversalIdentifier: idB,
        },
        [idB]: {
          universalIdentifier: idB,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          relationTargetFieldMetadataUniversalIdentifier: idA,
        },
      },
    };

    const result = topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
      metadataName: 'fieldMetadata',
      universalFlatEntityMaps: maps as never,
    });

    expect(result).toHaveLength(2);
    expect(result).toContain(idA);
    expect(result).toContain(idB);
  });
});
