import { Injectable } from '@nestjs/common';

import assert from 'assert';

import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { MappedObjectMetadataEntity } from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';

import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/workspace/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class ReflectiveMetadataFactory {
  async createObjectMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    defaultDataSourceId: string,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ): Promise<PartialObjectMetadata | undefined> {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', metadata);
    const fieldMetadata =
      TypedReflect.getMetadata('fieldMetadata', metadata) ?? {};

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${metadata.name}`,
      );
    }

    if (isGatedAndNotEnabled(objectMetadata, workspaceFeatureFlagsMap)) {
      return undefined;
    }

    const fields = Object.values(fieldMetadata).filter(
      (field) => !isGatedAndNotEnabled(field, workspaceFeatureFlagsMap),
    );

    return {
      ...objectMetadata,
      workspaceId,
      dataSourceId: defaultDataSourceId,
      fields: fields.map((field) => ({
        ...field,
        workspaceId,
        isSystem: objectMetadata.isSystem || field.isSystem,
        defaultValue: field.defaultValue,
      })),
    };
  }

  async createObjectMetadataCollection(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    dataSourceId: string,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    const metadataPromises = metadataCollection.map((metadata) =>
      this.createObjectMetadata(
        metadata,
        workspaceId,
        dataSourceId,
        workspaceFeatureFlagsMap,
      ),
    );
    const resolvedMetadata = await Promise.all(metadataPromises);

    return resolvedMetadata.filter(
      (metadata): metadata is PartialObjectMetadata => !!metadata,
    );
  }

  createRelationMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    objectMetadataFromDB: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', metadata);
    const relationMetadata = TypedReflect.getMetadata(
      'relationMetadata',
      metadata,
    );

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${metadata.name}`,
      );
    }

    if (
      !relationMetadata ||
      isGatedAndNotEnabled(objectMetadata, workspaceFeatureFlagsMap)
    ) {
      return [];
    }

    return relationMetadata
      .filter(
        (relation) => !isGatedAndNotEnabled(relation, workspaceFeatureFlagsMap),
      )
      .map((relation) => {
        const fromObjectMetadata =
          objectMetadataFromDB[relation.fromObjectNameSingular];

        assert(
          fromObjectMetadata,
          `Object ${relation.fromObjectNameSingular} not found in DB 
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toObjectMetadata =
          objectMetadataFromDB[relation.toObjectNameSingular];

        assert(
          toObjectMetadata,
          `Object ${relation.toObjectNameSingular} not found in DB
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        const fromFieldMetadata =
          fromObjectMetadata?.fields[relation.fromFieldMetadataName];

        assert(
          fromFieldMetadata,
          `Field ${relation.fromFieldMetadataName} not found in object ${relation.fromObjectNameSingular}
        for relation FROM defined in class ${objectMetadata.nameSingular}`,
        );

        const toFieldMetadata =
          toObjectMetadata?.fields[relation.toFieldMetadataName];

        assert(
          toFieldMetadata,
          `Field ${relation.toFieldMetadataName} not found in object ${relation.toObjectNameSingular}
        for relation TO defined in class ${objectMetadata.nameSingular}`,
        );

        return {
          relationType: relation.type,
          fromObjectMetadataId: fromObjectMetadata?.id,
          toObjectMetadataId: toObjectMetadata?.id,
          fromFieldMetadataId: fromFieldMetadata?.id,
          toFieldMetadataId: toFieldMetadata?.id,
          workspaceId,
        };
      });
  }

  createRelationMetadataCollection(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    objectMetadataFromDB: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    return metadataCollection.flatMap((metadata) =>
      this.createRelationMetadata(
        metadata,
        workspaceId,
        objectMetadataFromDB,
        workspaceFeatureFlagsMap,
      ),
    );
  }
}
