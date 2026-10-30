import {
  type PartialFieldMetadataItem,
  type RecordGqlOperationFilter,
  type RelationFilter,
} from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { computeMorphRelationJoinColumnNames } from '@/utils/filter/computeMorphRelationJoinColumnNames';
import { type FieldShared } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';

export const computeEmptyGqlOperationFilterForMorphRelation = ({
  correspondingFieldMetadataItem,
}: {
  correspondingFieldMetadataItem: Pick<PartialFieldMetadataItem, 'name'> &
    Pick<FieldShared, 'morphRelations'>;
}): RecordGqlOperationFilter => {
  const { name, morphRelations } = correspondingFieldMetadataItem;

  if (!isNonEmptyArray(morphRelations)) {
    return { [`${name}Id`]: { is: 'NULL' } satisfies RelationFilter };
  }

  return {
    and: computeMorphRelationJoinColumnNames({
      fieldMetadataItem: correspondingFieldMetadataItem,
    }).map((joinColumnName) => ({
      [joinColumnName]: { is: 'NULL' } satisfies RelationFilter,
    })),
  };
};
