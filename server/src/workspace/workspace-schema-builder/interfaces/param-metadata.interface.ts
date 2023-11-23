import { InputTypeDefinitionKind } from 'src/workspace/workspace-schema-builder/factories/input-type-definition.factory';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

import { ObjectMetadataInterface } from './object-metadata.interface';

export interface ArgMetadata<T = any> {
  kind?: InputTypeDefinitionKind;
  type?: FieldMetadataType;
  isNullable?: boolean;
  isArray?: boolean;
  defaultValue?: T;
}

export interface ArgsMetadata {
  args: {
    [key: string]: ArgMetadata;
  };
  objectMetadata: ObjectMetadataInterface;
}
