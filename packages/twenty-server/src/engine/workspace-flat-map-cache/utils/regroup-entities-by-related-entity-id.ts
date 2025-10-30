import { isDefined } from 'class-validator';
import { MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type RegroupEntitiesByRelatedEntityIdArgs<T extends AllMetadataName> =
  MetadataManyToOneJoinColumn<T> extends never
    ? never
    : {
        entities: MetadataEntity<T>[];
        foreignKey: MetadataManyToOneJoinColumn<T>;
      };
export const regroupEntitiesByRelatedEntityId = <T extends AllMetadataName>({
  entities,
  foreignKey,
}: RegroupEntitiesByRelatedEntityIdArgs<T>) => {
  const entitiesByRelatedEntityId = new Map<string, { id: string }[]>();

  for (const entity of entities) {
    const currentRelatedEntityId = entity[
      foreignKey as keyof MetadataEntity<T>
    ] as string;
    if (!isDefined(currentRelatedEntityId)) {
      continue;
    }

    if (!entitiesByRelatedEntityId.has(currentRelatedEntityId)) {
      entitiesByRelatedEntityId.set(currentRelatedEntityId, []);
    }

    entitiesByRelatedEntityId
      .get(currentRelatedEntityId)!
      .push({ id: entity.id });
  }

  return entitiesByRelatedEntityId;
};
