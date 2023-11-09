import { InputTypeDefinitionKind } from 'src/tenant/schema-builder/factories/input-type-definition.factory';
import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

import { ObjectMetadataInterface } from './object-metadata.interface';

export interface ArgMetadata {
  kind?: InputTypeDefinitionKind;
  type?: FieldMetadataType;
  isNullable?: boolean;
  isArray?: boolean;
}

export interface ArgsMetadata {
  args: {
    [key: string]: ArgMetadata;
  };
  objectMetadata: ObjectMetadataInterface;
}
