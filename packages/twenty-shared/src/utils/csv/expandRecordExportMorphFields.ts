import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type RelationType } from '@/types/RelationType';

export const expandRecordExportMorphFields = ({
  label,
  morphTargets,
}: {
  label: string;
  morphTargets: {
    fieldName: string;
    labelSingular: string;
    relationType: RelationType;
  }[];
}) =>
  morphTargets.map((target) => ({
    name: target.fieldName,
    label: `${label} / ${target.labelSingular}`,
    type: FieldMetadataType.MORPH_RELATION,
    relationType: target.relationType,
  }));
