import { type FieldMetadataType } from '@/types';
import { getFieldOrSubFieldType } from '@/utils/filter/getFieldOrSubFieldType';
import { getRlsPredicateCompatibleWorkspaceMemberFieldTypes } from '@/utils/filter/getRlsPredicateCompatibleWorkspaceMemberFieldTypes';

export const isWorkspaceMemberFieldCompatibleWithRlsPredicate = ({
  fieldType,
  subFieldName,
  workspaceMemberFieldType,
  workspaceMemberSubFieldName,
}: {
  fieldType: FieldMetadataType;
  subFieldName?: string | null;
  workspaceMemberFieldType: FieldMetadataType;
  workspaceMemberSubFieldName?: string | null;
}): boolean =>
  getRlsPredicateCompatibleWorkspaceMemberFieldTypes({
    fieldType,
    subFieldName,
  }).includes(
    getFieldOrSubFieldType({
      fieldType: workspaceMemberFieldType,
      subFieldName: workspaceMemberSubFieldName,
    }),
  );
