import { EntitySchema } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

// TODO: Doesn't going to work properly as ObjectMetadataEntity can differ based on workspaceId and cacheKey
export class ObjectEntitiesStorage {
  private static readonly objects: Map<EntitySchema, ObjectMetadataEntity> =
    new Map();

  public static getObjectMetadataEntity(
    target: EntitySchema,
  ): ObjectMetadataEntity | undefined {
    return this.objects.get(target);
  }

  public static setObjectMetadataEntity(
    target: EntitySchema,
    objectMetadata: ObjectMetadataEntity,
  ): void {
    this.objects.set(target, objectMetadata);
  }

  public static getObjectMetadataCollection(): ObjectMetadataEntity[] {
    return Array.from(this.objects.values());
  }

  public static getAllEntitySchemas(): EntitySchema[] {
    return Array.from(this.objects.keys());
  }

  public static clear(): void {
    this.objects.clear();
  }
}
