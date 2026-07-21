import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// The primary key already enforces uniqueness via its constraint, so it must not
// spawn a redundant application-managed unique index.
export const isPrimaryKeyFlatFieldMetadata = (
  flatFieldMetadata: Pick<UniversalFlatFieldMetadata, 'name'>,
): boolean => flatFieldMetadata.name === 'id';
