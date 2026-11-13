import { FieldMetadataType } from '@/types';
import { isWorkspaceMemberFieldCompatibleWithRlsPredicate } from '@/utils/filter/isWorkspaceMemberFieldCompatibleWithRlsPredicate';

describe('isWorkspaceMemberFieldCompatibleWithRlsPredicate', () => {
  it('should compare a text field to a text sub field of the member', () => {
    expect(
      isWorkspaceMemberFieldCompatibleWithRlsPredicate({
        fieldType: FieldMetadataType.TEXT,
        workspaceMemberFieldType: FieldMetadataType.FULL_NAME,
        workspaceMemberSubFieldName: 'firstName',
      }),
    ).toBe(true);
  });

  it('should compare a relation field to the id of the member', () => {
    expect(
      isWorkspaceMemberFieldCompatibleWithRlsPredicate({
        fieldType: FieldMetadataType.RELATION,
        workspaceMemberFieldType: FieldMetadataType.UUID,
      }),
    ).toBe(true);
  });

  it('should refuse a text field compared to a member list', () => {
    expect(
      isWorkspaceMemberFieldCompatibleWithRlsPredicate({
        fieldType: FieldMetadataType.TEXT,
        workspaceMemberFieldType: FieldMetadataType.ARRAY,
      }),
    ).toBe(false);
  });
});
