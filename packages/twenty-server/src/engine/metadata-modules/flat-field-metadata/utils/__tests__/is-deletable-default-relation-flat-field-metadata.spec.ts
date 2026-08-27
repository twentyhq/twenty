import { FieldMetadataType } from 'twenty-shared/types';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { isDeletableDefaultRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-deletable-default-relation-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const buildRelationField = (
  overrides: Partial<UniversalFlatFieldMetadata> = {},
): UniversalFlatFieldMetadata =>
  ({
    type: FieldMetadataType.RELATION,
    isSystemSideEffect: true,
    relationTargetObjectMetadataUniversalIdentifier: '',
    objectMetadataUniversalIdentifier: '',
    ...overrides,
  }) as unknown as UniversalFlatFieldMetadata;

describe('isDeletableDefaultRelationFlatFieldMetadata', () => {
  it('should return true for attachment relation targeting attachment object', () => {
    const field = buildRelationField({
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(true);
  });

  it('should return true for noteTarget relation targeting noteTarget object', () => {
    const field = buildRelationField({
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(true);
  });

  it('should return true for taskTarget relation targeting taskTarget object', () => {
    const field = buildRelationField({
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(true);
  });

  it('should return false for timelineActivity relation', () => {
    const field = buildRelationField({
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.timelineActivity,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(false);
  });

  it('should return false when field is not a system side effect', () => {
    const field = buildRelationField({
      isSystemSideEffect: false,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(false);
  });

  it('should return false when field is not a relation type', () => {
    const field = {
      type: FieldMetadataType.TEXT,
      isSystemSideEffect: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    } as unknown as UniversalFlatFieldMetadata;

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(false);
  });

  it('should return false for non-default-relation target', () => {
    const field = buildRelationField({
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(false);
  });

  it('should return true when object itself is a deletable default relation (reverse direction)', () => {
    const field = buildRelationField({
      objectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
      relationTargetObjectMetadataUniversalIdentifier: 'some-custom-object',
    });

    expect(isDeletableDefaultRelationFlatFieldMetadata(field)).toBe(true);
  });
});
