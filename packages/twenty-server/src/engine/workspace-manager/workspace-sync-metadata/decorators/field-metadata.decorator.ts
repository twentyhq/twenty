import {
  FieldMetadataDecoratorParams,
  ReflectFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';
import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { TypedReflect } from 'src/utils/typed-reflect';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

export function FieldMetadata<T extends FieldMetadataType>(
  params: FieldMetadataDecoratorParams<T>,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const existingFieldMetadata =
      TypedReflect.getMetadata('fieldMetadataMap', target.constructor) ?? {};
    const isNullable =
      TypedReflect.getMetadata('isNullable', target, fieldKey) ?? false;
    const isSystem =
      TypedReflect.getMetadata('isSystem', target, fieldKey) ?? false;
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);
    const { joinColumn, standardId, ...restParams } = params;

    TypedReflect.defineMetadata(
      'fieldMetadataMap',
      {
        ...existingFieldMetadata,
        [fieldKey]: generateFieldMetadata<T>(
          {
            ...restParams,
            standardId,
          },
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
                  standardId: createDeterministicUuid(standardId),
                  type: FieldMetadataType.UUID,
                  label: `${restParams.label} id (foreign key)`,
                  description: `${restParams.description} id foreign key`,
                  defaultValue: null,
                  options: undefined,
                  settings: undefined,
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
  const defaultValue = (params.defaultValue ??
    generateDefaultValue(
      params.type,
    )) as FieldMetadataDefaultValue<'default'> | null;

  return {
    name: fieldKey,
    ...params,
    isNullable: params.type === FieldMetadataType.RELATION ? true : isNullable,
    isSystem,
    isCustom: false,
    options: params.options,
    description: params.description,
    icon: params.icon,
    defaultValue,
    gate,
  };
}
