import { type MessageDescriptor } from '@lingui/core';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import {
  type FieldMetadataOptions,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceFieldOptions<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    // Use @WorkspaceRelation or @WorkspaceDynamicRelation for relation fields
    FieldMetadataType.RELATION
  >,
> {
  standardId: string;
  type: T;
  label: MessageDescriptor;
  description?: MessageDescriptor;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettings<T>;
  isActive?: boolean;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}

export function WorkspaceField<T extends FieldMetadataType>(
  options: WorkspaceFieldOptions<T>,
): PropertyDecorator {
  return (object, propertyKey) => {
    const isPrimary =
      TypedReflect.getMetadata(
        'workspace:is-primary-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isNullable =
      TypedReflect.getMetadata(
        'workspace:is-nullable-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isSystem =
      TypedReflect.getMetadata(
        'workspace:is-system-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isUIReadOnly =
      TypedReflect.getMetadata(
        'workspace:is-field-ui-readonly-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      object,
      propertyKey.toString(),
    );
    const isDeprecated =
      TypedReflect.getMetadata(
        'workspace:is-deprecated-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isUnique =
      TypedReflect.getMetadata(
        'workspace:is-unique-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;

    const defaultValue = (options.defaultValue ??
      generateDefaultValue(options.type)) as FieldMetadataDefaultValue | null;
    const name = propertyKey.toString();
    const label = options.label.message ?? '';
    const isLabelSyncedWithName =
      computeMetadataNameFromLabel({ label }) === name;

    metadataArgsStorage.addFields({
      target: object.constructor,
      standardId: options.standardId,
      name,
      label,
      type: options.type,
      isLabelSyncedWithName,
      description: options.description?.message ?? '',
      icon: options.icon,
      defaultValue,
      options: options.options,
      settings: options.settings,
      isPrimary,
      isNullable,
      isSystem,
      isUIReadOnly,
      gate,
      isDeprecated,
      isUnique,
      isActive: options.isActive,
      asExpression: options.asExpression,
      generatedType: options.generatedType,
    });
  };
}
