import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

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

  return roots.reduce<string[]>((sorted, root) => {
    sorted.push(root);

    for (let i = sorted.length - 1; i < sorted.length; i++) {
      const children = childrenByParent.get(sorted[i]) ?? [];

      sorted.push(...children);
    }

    return sorted;
  }, []);
};
