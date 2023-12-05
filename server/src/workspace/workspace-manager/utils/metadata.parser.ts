import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { BaseObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/base.object-metadata';

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
          defaultValue: field.defaultValue || null, // TODO: use default default value based on field type
          options: field.options || null,
        })),
      };
    }

    return undefined;
  }

  static parseAllMetadata(
    metadata: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    dataSourceId: string,
  ) {
    return metadata.map((_metadata) =>
      MetadataParser.parseMetadata(_metadata, workspaceId, dataSourceId),
    );
  }
}
