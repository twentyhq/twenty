import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validatePredicateValueCompatibility } from 'src/engine/twenty-orm/utils/validate-predicate-value-compatibility.util';

describe('validatePredicateValueCompatibility', () => {
  const createMockFieldMetadata = (
    type: FieldMetadataType,
    options?: Array<{ value: string; label: string }>,
  ): FlatFieldMetadata => {
    return {
      id: 'mock-id',
      name: 'mockField',
      type,
      options: options || [],
    } as FlatFieldMetadata;
  };

  describe('when both fields are enum types', () => {
    it('should return true when value exists in target field options', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ]);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'option1',
      });

      expect(result).toBe(true);
    });

    it('should return false when value does not exist in target field options', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, [
        { value: 'option3', label: 'Option 3' },
        { value: 'option4', label: 'Option 4' },
      ]);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'option1',
      });

      expect(result).toBe(false);
    });

    it('should validate array values for MULTI_SELECT fields', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      );

      const targetField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ],
      );

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: ['option1', 'option2'],
      });

      expect(result).toBe(true);
    });

    it('should return false when any value in array is invalid', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      );

      const targetField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option3', label: 'Option 3' },
        ],
      );

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: ['option1', 'option2'],
      });

      expect(result).toBe(false);
    });

    it('should return true when target field has no options', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, []);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'option1',
      });

      expect(result).toBe(true);
    });

    it('should handle SELECT to MULTI_SELECT comparison', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      );

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'option1',
      });

      expect(result).toBe(true);
    });
  });

  describe('when fields are not both enum types', () => {
    it('should return true when workspace member field is not enum', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.TEXT,
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, [
        { value: 'option1', label: 'Option 1' },
      ]);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'some text',
      });

      expect(result).toBe(true);
    });

    it('should return true when target field is not enum', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.TEXT);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'option1',
      });

      expect(result).toBe(true);
    });

    it('should return true when neither field is enum', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.TEXT,
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.TEXT);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: 'some text',
      });

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined value', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, [
        { value: 'option1', label: 'Option 1' },
      ]);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: undefined,
      });

      expect(result).toBe(false);
    });

    it('should handle null value', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(FieldMetadataType.SELECT, [
        { value: 'option1', label: 'Option 1' },
      ]);

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: null,
      });

      expect(result).toBe(false);
    });

    it('should handle empty array', () => {
      const workspaceMemberField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const targetField = createMockFieldMetadata(
        FieldMetadataType.MULTI_SELECT,
        [{ value: 'option1', label: 'Option 1' }],
      );

      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: workspaceMemberField,
        targetFieldMetadata: targetField,
        predicateValue: [],
      });

      expect(result).toBe(true);
    });
  });
  describe('when the workspace member field is a relation', () => {
    const createMockRelationFieldMetadata = (
      relationTargetObjectMetadataId: string,
    ): FlatFieldMetadata => {
      return {
        id: 'mock-relation-id',
        name: 'region',
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataId,
      } as FlatFieldMetadata;
    };

    it('should return true when both relations target the same object', () => {
      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata:
          createMockRelationFieldMetadata('region-object-id'),
        targetFieldMetadata:
          createMockRelationFieldMetadata('region-object-id'),
        predicateValue: '20202020-0000-0000-0000-000000000001',
      });

      expect(result).toBe(true);
    });

    it('should return false when the relations target different objects', () => {
      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata:
          createMockRelationFieldMetadata('region-object-id'),
        targetFieldMetadata: createMockRelationFieldMetadata('team-object-id'),
        predicateValue: '20202020-0000-0000-0000-000000000001',
      });

      expect(result).toBe(false);
    });

    it('should return false when the target field is not a relation', () => {
      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata:
          createMockRelationFieldMetadata('region-object-id'),
        targetFieldMetadata: createMockFieldMetadata(FieldMetadataType.TEXT),
        predicateValue: '20202020-0000-0000-0000-000000000001',
      });

      expect(result).toBe(false);
    });

    it('should keep allowing the workspace member id against a relation field', () => {
      const result = validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: createMockFieldMetadata(
          FieldMetadataType.UUID,
        ),
        targetFieldMetadata: createMockRelationFieldMetadata(
          'workspace-member-object-id',
        ),
        predicateValue: '20202020-0000-0000-0000-000000000001',
      });

      expect(result).toBe(true);
    });
  });
});
