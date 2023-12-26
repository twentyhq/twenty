import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';
import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export interface FieldMetadataDecoratorParams<
  T extends FieldMetadataType | 'default',
> {
  type: T;
  label: string;
  description?: string;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  joinColumn?: string;
}

export interface ReflectFieldMetadata {
  [key: string]: Omit<
    FieldMetadataDecoratorParams<'default'>,
    'defaultValue' | 'type'
  > & {
    name: string;
    type: FieldMetadataType;
    targetColumnMap: string;
    isNullable: boolean;
    isSystem: boolean;
    isCustom: boolean;
    description?: string;
    defaultValue: string | null;
    gate?: GateDecoratorParams;
  };
}
