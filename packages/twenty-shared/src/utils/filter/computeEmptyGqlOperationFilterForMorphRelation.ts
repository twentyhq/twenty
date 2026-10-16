import {
  type PartialFieldMetadataItem,
  type RecordGqlOperationFilter,
  type RelationFilter,
} from '@/types';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { computeMorphRelationGqlFieldJoinColumnName } from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';
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
    and: morphRelations.map((morphRelation) => ({
      [computeMorphRelationGqlFieldJoinColumnName({
        fieldName: name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      })]: { is: 'NULL' } satisfies RelationFilter,
    })),
  };
};
