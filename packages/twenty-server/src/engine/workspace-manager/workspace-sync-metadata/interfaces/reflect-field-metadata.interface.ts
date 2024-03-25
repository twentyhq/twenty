import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-target-column-map.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export interface FieldMetadataDecoratorParams<
  T extends FieldMetadataType | 'default',
> {
  standardId: string;
  type: T;
  label: string | ((objectMetadata: ObjectMetadataEntity) => string);
  description?: string | ((objectMetadata: ObjectMetadataEntity) => string);
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  joinColumn?: string;
  options?: FieldMetadataOptions<T>;
}

export interface ReflectFieldMetadata {
  [key: string]: Omit<
    FieldMetadataDecoratorParams<'default'>,
    'defaultValue' | 'type' | 'options'
  > & {
    name: string;
    type: FieldMetadataType;
    targetColumnMap: FieldMetadataTargetColumnMap<'default'>;
    isNullable: boolean;
    isSystem: boolean;
    isCustom: boolean;
    defaultValue: FieldMetadataDefaultValue<'default'> | null;
    gate?: GateDecoratorParams;
    options?: FieldMetadataOptions<'default'> | null;
  };
}
