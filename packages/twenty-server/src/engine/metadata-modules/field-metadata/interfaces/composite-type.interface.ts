import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export interface CompositeProperty {
  name: string;
  description?: string;
  type: FieldMetadataType;
  hidden: 'input' | 'output' | true | false;
  isRequired: boolean;
  isArray?: boolean;
}

export interface CompositeType {
  type: FieldMetadataType;
  properties: CompositeProperty[];
}
