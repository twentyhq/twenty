import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const DELETABLE_DEFAULT_RELATION_TARGET_UNIVERSAL_IDENTIFIERS: ReadonlySet<string> =
  new Set([
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget,
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget,
  ]);

export const isDeletableDefaultRelationFlatFieldMetadata = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
): boolean => {
  if (
    flatFieldMetadata.isSystemSideEffect !== true ||
    !isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata)
  ) {
    return false;
  }

  return (
    DELETABLE_DEFAULT_RELATION_TARGET_UNIVERSAL_IDENTIFIERS.has(
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    ) ||
    DELETABLE_DEFAULT_RELATION_TARGET_UNIVERSAL_IDENTIFIERS.has(
      flatFieldMetadata.objectMetadataUniversalIdentifier,
    )
  );
};
