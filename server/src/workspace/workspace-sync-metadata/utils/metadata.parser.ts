import assert from 'assert';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

export class MetadataParser {
  static parseMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    dataSourceId: string,
  ) {
    const objectMetadata = Reflect.getMetadata('objectMetadata', metadata);
    const fieldMetadata = Reflect.getMetadata('fieldMetadata', metadata);

    if (objectMetadata) {
      const fields = Object.values(fieldMetadata);

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

    return undefined;
  }

  static parseAllMetadata(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    dataSourceId: string,
  ) {
    return metadataCollection.map((metadata) =>
      MetadataParser.parseMetadata(metadata, workspaceId, dataSourceId),
    );
  }

  static parseRelationMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    objectMetadataFromDB: Record<string, ObjectMetadataEntity>,
  ) {
    const objectMetadata = Reflect.getMetadata('objectMetadata', metadata);
    const relationMetadata = Reflect.getMetadata('relationMetadata', metadata);

    if (!relationMetadata) return [];

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
  ) {
    return metadataCollection.flatMap((metadata) =>
      MetadataParser.parseRelationMetadata(
        metadata,
        workspaceId,
        objectMetadataFromDB,
      ),
    );
  }
}
