import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';

export class MetadataParser {
  static parseMetadata(metadata, workspaceId, dataSourceId) {
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
          defaultValue: field.defaultValue || null, // TODO: use default default value based on field type
          options: field.options || null,
        })),
      };
    }

    return undefined;
  }

  static parseAllMetadata(entities, workspaceId, dataSourceId) {
    return entities.map((metadata) =>
      MetadataParser.parseMetadata(metadata, workspaceId, dataSourceId),
    );
  }
}
