import assert from 'assert';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

export class MetadataParser {
  static parseMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    dataSourceId: string,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ): ObjectMetadataEntity | undefined {
    const objectMetadata = Reflect.getMetadata('objectMetadata', metadata);
    const fieldMetadata = Reflect.getMetadata('fieldMetadata', metadata);

    if (!objectMetadata) {
      throw new Error(
        `Object metadata decorator not found, can\'t parse ${metadata.name}`,
      );
    }

    const objectFeatureFlagValue =
      objectMetadata.gate?.featureFlag &&
      workspaceFeatureFlagsMap[objectMetadata.gate.featureFlag];

    if (
      objectMetadata.gate?.featureFlag !== undefined &&
      !objectFeatureFlagValue
    ) {
      return undefined;
    }

    const fields = Object.values(fieldMetadata).filter((field: any) => {
      const fieldFeatureFlagValue =
        field.gate?.featureFlag &&
        workspaceFeatureFlagsMap[field.gate.featureFlag];

      if (field.gate?.featureFlag !== undefined && !fieldFeatureFlagValue)
        return false;

      return true;
    });

    return {
      ...objectMetadata,
      workspaceId,
      dataSourceId,
      fields: fields.map((field: FieldMetadataEntity) => ({
        ...field,
        workspaceId,
        isSystem: objectMetadata.isSystem || field.isSystem,
        defaultValue: field.defaultValue || null,
        options: field.options || null,
      })),
    };
  }

  static parseAllMetadata(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    dataSourceId: string,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ): ObjectMetadataEntity[] {
    return metadataCollection
      .map((metadata) =>
        MetadataParser.parseMetadata(
          metadata,
          workspaceId,
          dataSourceId,
          workspaceFeatureFlagsMap,
        ),
      )
      .filter(
        (metadata): metadata is ObjectMetadataEntity => metadata !== undefined,
      );
  }

  static parseRelationMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    objectMetadataFromDB: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    const objectMetadata = Reflect.getMetadata('objectMetadata', metadata);
    const relationMetadata = Reflect.getMetadata('relationMetadata', metadata);

    if (!relationMetadata) return [];

<<<<<<< HEAD
    return relationMetadata.map((relation) => {
      const fromObjectMetadata =
        objectMetadataFromDB[relation.fromObjectNameSingular];

      assert(
        fromObjectMetadata,
        `Object ${relation.fromObjectNameSingular} not found in DB 
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const toObjectMetadata =
        objectMetadataFromDB[relation.toObjectNameSingular];

      assert(
        toObjectMetadata,
        `Object ${relation.toObjectNameSingular} not found in DB
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const fromFieldMetadata =
        fromObjectMetadata?.fields[relation.fromFieldMetadataName];

      assert(
        fromFieldMetadata,
        `Field ${relation.fromFieldMetadataName} not found in object ${relation.fromObjectNameSingular}
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const toFieldMetadata =
        toObjectMetadata?.fields[relation.toFieldMetadataName];

      assert(
        toFieldMetadata,
        `Field ${relation.toFieldMetadataName} not found in object ${relation.toObjectNameSingular}
=======
    return relationMetadata
      .filter((relation: any) => {
        const fieldFeatureFlagValue =
          relation.gate?.featureFlag &&
          workspaceFeatureFlagsMap[relation.gate.featureFlag];

        if (relation.gate?.featureFlag !== undefined && !fieldFeatureFlagValue)
          return false;

        return true;
      })
      .map((relation) => {
        const fromObjectMetadata =
          objectMetadataFromDB[relation.fromObjectNameSingular];

        assert(
          fromObjectMetadata,
          `Object ${relation.fromObjectNameSingular} not found in DB 
>>>>>>> 7c8b8fae (Add featureFlag gateDecorator for sync-metadata)
        for relation defined in class ${objectMetadata.nameSingular}`,
        );

        const toObjectMetadata =
          objectMetadataFromDB[relation.toObjectNameSingular];

        assert(
          toObjectMetadata,
          `Object ${relation.toObjectNameSingular} not found in DB
        for relation defined in class ${objectMetadata.nameSingular}`,
        );

        const fromFieldMetadata =
          fromObjectMetadata?.fields[relation.fromFieldMetadataName];

        assert(
          fromFieldMetadata,
          `Field ${relation.fromFieldMetadataName} not found in object ${relation.fromObjectNameSingular}
        for relation defined in class ${objectMetadata.nameSingular}`,
        );

        const toFieldMetadata =
          toObjectMetadata?.fields[relation.toFieldMetadataName];

        assert(
          toFieldMetadata,
          `Field ${relation.toFieldMetadataName} not found in object ${relation.toObjectNameSingular}
        for relation defined in class ${objectMetadata.nameSingular}`,
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

  static parseAllRelations(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    objectMetadataFromDB: Record<string, ObjectMetadataEntity>,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    return metadataCollection.flatMap((metadata) =>
      MetadataParser.parseRelationMetadata(
        metadata,
        workspaceId,
        objectMetadataFromDB,
        workspaceFeatureFlagsMap,
      ),
    );
  }
}
