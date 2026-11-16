import { type FieldMetadataOptionColumns } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';

export const resolveEffectiveFieldMetadataOptionColumns = ({
  universalFlatFieldMetadataOption,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  universalFlatFieldMetadataOption: UniversalFlatFieldMetadataOption;
  workspaceCustomApplicationUniversalIdentifier?: string;
}): FieldMetadataOptionColumns => {
  const { value, label, color, position, isActive } =
    resolveEffectiveFlatEntity({
      metadataName: 'fieldMetadataOption',
      flatEntity: universalFlatFieldMetadataOption,
      authorContext: { workspaceCustomApplicationUniversalIdentifier },
    });

  return { value, label, color, position, isActive };
};
