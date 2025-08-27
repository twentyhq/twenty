import { type MessageDescriptor } from '@lingui/core';

import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceEntityOptions {
  standardId: string;
  namePlural: string;
  labelSingular: MessageDescriptor;
  labelPlural: MessageDescriptor;
  description?: MessageDescriptor;
  icon?: string;
  shortcut?: string;
  labelIdentifierStandardId?: string;
  imageIdentifierStandardId?: string;
}

export function WorkspaceEntity(
  options: WorkspaceEntityOptions,
): ClassDecorator {
  return (target) => {
    const isAuditLogged =
      TypedReflect.getMetadata(
        'workspace:is-audit-logged-metadata-args',
        target,
      ) ?? true;
    const isSystem =
      TypedReflect.getMetadata('workspace:is-system-metadata-args', target) ??
      false;
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      target,
    );
    const duplicateCriteria = TypedReflect.getMetadata(
      'workspace:duplicate-criteria-metadata-args',
      target,
    );
    const isSearchable =
      TypedReflect.getMetadata(
        'workspace:is-searchable-metadata-args',
        target,
      ) ?? false;
    const isUIReadOnly =
      TypedReflect.getMetadata(
        'workspace:is-object-ui-readonly-metadata-args',
        target,
      ) ?? false;

    const objectName = convertClassNameToObjectMetadataName(target.name);

    metadataArgsStorage.addEntities({
      target,
      standardId: options.standardId,
      nameSingular: objectName,
      namePlural: options.namePlural,
      labelSingular: options.labelSingular?.message ?? '',
      labelPlural: options.labelPlural?.message ?? '',
      description: options.description?.message ?? '',
      labelIdentifierStandardId:
        options.labelIdentifierStandardId ?? BASE_OBJECT_STANDARD_FIELD_IDS.id,
      imageIdentifierStandardId: options.imageIdentifierStandardId ?? null,
      icon: options.icon,
      shortcut: options.shortcut,
      isAuditLogged,
      isSystem,
      isUIReadOnly,
      gate,
      duplicateCriteria,
      isSearchable,
    });
  };
}
