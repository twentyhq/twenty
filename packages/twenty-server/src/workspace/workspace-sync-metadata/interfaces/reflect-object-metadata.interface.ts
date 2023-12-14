export interface ObjectMetadataDecoratorParams {
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  dataSourceSchema?: string;
}

export interface ReflectObjectMetadata extends ObjectMetadataDecoratorParams {
  nameSingular: string;
  targetTableName: string;
  isSystem: boolean;
  isCustom: boolean;
}
