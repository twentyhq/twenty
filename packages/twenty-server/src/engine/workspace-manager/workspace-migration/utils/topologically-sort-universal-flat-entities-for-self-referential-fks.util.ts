import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

// fieldMetadata has bidirectional self-references (relation field A -> B and
// B -> A) that are handled by a separate pre-allocation code path in the
// runner. Cycles are expected and safe to append unsorted here.
const METADATA_NAMES_WITH_EXPECTED_CYCLES = new Set<AllMetadataName>([
  'fieldMetadata',
]);

const getSelfReferentialUniversalForeignKeys = (
  metadataName: AllMetadataName,
): string[] =>
  Object.values(ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName])
    .filter(
      (
        relation,
      ): relation is {
        metadataName: AllMetadataName;
        universalForeignKey: string;
      } => isDefined(relation) && relation.metadataName === metadataName,
    )
    .map((relation) => relation.universalForeignKey);

const getParentUniversalIdentifier = ({
  entity,
  selfReferentialUniversalForeignKeys,
}: {
  entity: Record<string, unknown>;
  selfReferentialUniversalForeignKeys: string[];
}): string | null =>
  selfReferentialUniversalForeignKeys.reduce<string | null>(
    (found, universalForeignKey) =>
      found ??
      (entity[universalForeignKey] as string | null | undefined) ??
      null,
    null,
  );

// Sorts universal identifiers so that parents come before children
// for entities with self-referential FKs (e.g. navigationMenuItem.folder,
// viewFilterGroup.parentViewFilterGroup). Returns original order unchanged
// for entities without self-referential FKs.
export const topologicallySortUniversalFlatEntitiesForSelfReferentialFks = <
  T extends AllMetadataName,
>({
  metadataName,
  universalFlatEntityMaps,
}: {
  metadataName: T;
  universalFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
}): string[] => {
  const selfReferentialUniversalForeignKeys =
    getSelfReferentialUniversalForeignKeys(metadataName);

  const allUniversalIdentifiers = Object.keys(
    universalFlatEntityMaps.byUniversalIdentifier,
  );

  if (selfReferentialUniversalForeignKeys.length === 0) {
    return allUniversalIdentifiers;
  }

  const universalIdentifierSet = new Set(allUniversalIdentifiers);

  const childrenByParent = new Map<string, string[]>();
  const inDegree = new Map<string, number>(
    allUniversalIdentifiers.map((id) => [id, 0]),
  );

  for (const universalIdentifier of allUniversalIdentifiers) {
    const entity = universalFlatEntityMaps.byUniversalIdentifier[
      universalIdentifier
    ] as Record<string, unknown> | undefined;

    if (!isDefined(entity)) {
      continue;
    }

    const parentId = getParentUniversalIdentifier({
      entity,
      selfReferentialUniversalForeignKeys,
    });

    if (isDefined(parentId) && universalIdentifierSet.has(parentId)) {
      childrenByParent.set(parentId, [
        ...(childrenByParent.get(parentId) ?? []),
        universalIdentifier,
      ]);
      inDegree.set(
        universalIdentifier,
        (inDegree.get(universalIdentifier) ?? 0) + 1,
      );
    }
  }

  const roots = allUniversalIdentifiers.filter(
    (id) => (inDegree.get(id) ?? 0) === 0,
  );

  const sorted = roots.reduce<string[]>((accumulator, root) => {
    accumulator.push(root);

    for (let i = accumulator.length - 1; i < accumulator.length; i++) {
      const children = childrenByParent.get(accumulator[i]) ?? [];

      accumulator.push(...children);
    }

    return accumulator;
  }, []);

  if (sorted.length < allUniversalIdentifiers.length) {
    if (!METADATA_NAMES_WITH_EXPECTED_CYCLES.has(metadataName)) {
      throw new Error(
        `Cyclic self-referential foreign key detected for ${metadataName}: ` +
          `expected ${allUniversalIdentifiers.length} entities but sorted ${sorted.length}. ` +
          `This entity does not use deferrable FKs, so cycles are not supported.`,
      );
    }

    // Bidirectional self-references (e.g. fieldMetadata relation pairs where
    // A -> B and B -> A) create cycles that cannot be topologically sorted.
    // These rely on DEFERRABLE INITIALLY DEFERRED FKs at the DB level,
    // so we append them at the end in their original order.
    const sortedSet = new Set(sorted);

    for (const universalIdentifier of allUniversalIdentifiers) {
      if (!sortedSet.has(universalIdentifier)) {
        sorted.push(universalIdentifier);
      }
    }
  }

  return sorted;
};
