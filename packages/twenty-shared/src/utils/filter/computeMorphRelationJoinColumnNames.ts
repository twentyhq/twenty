import { type PartialFieldMetadataItem } from '@/types';
import { computeMorphRelationGqlFieldJoinColumnName } from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';
import { type FieldShared } from '@/utils/filter/turnRecordFilterIntoGqlOperationFilter';

export const computeMorphRelationJoinColumnNames = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<PartialFieldMetadataItem, 'name'> &
    Pick<FieldShared, 'morphRelations'>;
}): string[] =>
  (fieldMetadataItem.morphRelations ?? []).map((morphRelation) =>
    computeMorphRelationGqlFieldJoinColumnName({
      fieldName: fieldMetadataItem.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    }),
  );
