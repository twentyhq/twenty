import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/constants/CompositeFieldSubFieldLabels';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RecordExportColumn } from '@/types/RecordExportColumn';
import { RelationType } from '@/types/RelationType';
import { computeRelationGqlFieldJoinColumnName } from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';

const FIELD_SUB_FIELD_LABELS: Partial<
  Record<FieldMetadataType, Record<string, string>>
> = COMPOSITE_FIELD_SUB_FIELD_LABELS;

export const buildRecordExportColumns = (
  fields: {
    name: string;
    label: string;
    type: FieldMetadataType;
    relationType?: RelationType;
    subFieldLabels?: Record<string, string>;
  }[],
): RecordExportColumn[] => [
  { fieldName: 'id', label: 'Id', type: FieldMetadataType.UUID },
  ...fields
    .filter((field) => field.name !== 'id')
    .flatMap((field): RecordExportColumn[] => {
      if (
        field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION
      ) {
        return field.relationType === RelationType.MANY_TO_ONE
          ? [
              {
                fieldName: computeRelationGqlFieldJoinColumnName(field),
                label: `${field.label} Id`,
                type: FieldMetadataType.UUID,
              },
            ]
          : [];
      }

      const subFields = FIELD_SUB_FIELD_LABELS[field.type];

      return subFields
        ? Object.entries(subFields).map(([subFieldName, label]) => ({
            fieldName: field.name,
            label: `${field.label} / ${field.subFieldLabels?.[subFieldName] ?? label}`,
            type: field.type,
            subFieldName,
          }))
        : [{ fieldName: field.name, label: field.label, type: field.type }];
    }),
];
