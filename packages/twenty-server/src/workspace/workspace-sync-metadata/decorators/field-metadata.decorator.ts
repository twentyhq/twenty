import {
  FieldMetadataDecoratorParams,
  ReflectFieldMetadata,
} from 'src/workspace/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';
import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { generateDefaultValue } from 'src/metadata/field-metadata/utils/generate-default-value';
import { TypedReflect } from 'src/utils/typed-reflect';

export function FieldMetadata<T extends FieldMetadataType>(
  params: FieldMetadataDecoratorParams<T>,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingFieldMetadata =
      TypedReflect.getMetadata('fieldMetadata', target.constructor) ?? {};
    const isNullable =
      TypedReflect.getMetadata('isNullable', target, fieldKey) ?? false;
    const isSystem =
      TypedReflect.getMetadata('isSystem', target, fieldKey) ?? false;
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);
    const { joinColumn, ...restParams } = params;

    TypedReflect.defineMetadata(
      'fieldMetadata',
      {
        ...existingFieldMetadata,
        [fieldKey]: generateFieldMetadata<T>(
          restParams,
          fieldKey,
          isNullable,
          isSystem,
          gate,
        ),
        ...(joinColumn && restParams.type === FieldMetadataType.RELATION
          ? {
              [joinColumn]: generateFieldMetadata<FieldMetadataType.UUID>(
                {
                  ...restParams,
                  type: FieldMetadataType.UUID,
                  label: `${restParams.label} id (foreign key)`,
                  description: `${restParams.description} id foreign key`,
                  defaultValue: null,
                },
                joinColumn,
                isNullable,
                true,
                gate,
              ),
            }
          : {}),
      },
      target.constructor,
    );
  };
}

function generateFieldMetadata<T extends FieldMetadataType>(
  params: FieldMetadataDecoratorParams<T>,
  fieldKey: string,
  isNullable: boolean,
  isSystem: boolean,
  gate: GateDecoratorParams | undefined = undefined,
): ReflectFieldMetadata[string] {
  const targetColumnMap = generateTargetColumnMap(params.type, false, fieldKey);
  const defaultValue = params.defaultValue ?? generateDefaultValue(params.type);

  return {
    name: fieldKey,
    ...params,
    targetColumnMap: JSON.stringify(targetColumnMap),
    isNullable: params.type === FieldMetadataType.RELATION ? true : isNullable,
    isSystem,
    isCustom: false,
    // TODO: handle options + stringify for the diff.
    description: params.description,
    icon: params.icon,
    defaultValue: defaultValue ? JSON.stringify(defaultValue) : null,
    gate,
  };
}
