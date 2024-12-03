import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { TypedReflect } from 'src/utils/typed-reflect';

interface WorkspaceEntityOptions {
  standardId: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
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
    const objectName = convertClassNameToObjectMetadataName(target.name);

    metadataArgsStorage.addEntities({
      target,
      standardId: options.standardId,
      nameSingular: objectName,
      namePlural: options.namePlural,
      labelSingular: options.labelSingular,
      labelPlural: options.labelPlural,
      description: options.description,
      labelIdentifierStandardId:
        options.labelIdentifierStandardId ?? BASE_OBJECT_STANDARD_FIELD_IDS.id,
      imageIdentifierStandardId: options.imageIdentifierStandardId ?? null,
      icon: options.icon,
      shortcut: options.shortcut,
      isAuditLogged,
      isSystem,
      gate,
    });
  };
}
