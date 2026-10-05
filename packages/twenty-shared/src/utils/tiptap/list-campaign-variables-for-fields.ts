import { FieldMetadataType } from '@/types';

export type CampaignVariableDefinition = {
  name: string;
  label: string;
  fieldName: string;
  fieldType: FieldMetadataType;
  subFieldName?: string;
};

type CampaignVariableEligibleField = {
  name: string;
  label: string;
  type: FieldMetadataType;
  isSystem?: boolean | null;
  isActive?: boolean | null;
};

const SCALAR_CAMPAIGN_VARIABLE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
  FieldMetadataType.RATING,
];

const COMPOSITE_CAMPAIGN_VARIABLE_SUBFIELDS: Partial<
  Record<FieldMetadataType, { subFieldName: string; subFieldLabel: string }[]>
> = {
  [FieldMetadataType.FULL_NAME]: [
    { subFieldName: 'firstName', subFieldLabel: 'First name' },
    { subFieldName: 'lastName', subFieldLabel: 'Last name' },
  ],
};

export const listCampaignVariablesForFields = (
  fields: CampaignVariableEligibleField[],
): CampaignVariableDefinition[] => {
  const definitions: CampaignVariableDefinition[] = [];

  for (const field of fields) {
    if (field.isSystem === true || field.isActive === false) {
      continue;
    }

    if (SCALAR_CAMPAIGN_VARIABLE_FIELD_TYPES.includes(field.type)) {
      definitions.push({
        name: field.name,
        label: field.label,
        fieldName: field.name,
        fieldType: field.type,
      });
      continue;
    }

    const subFields = COMPOSITE_CAMPAIGN_VARIABLE_SUBFIELDS[field.type];

    if (!subFields) {
      continue;
    }

    for (const { subFieldName, subFieldLabel } of subFields) {
      definitions.push({
        name: `${field.name}.${subFieldName}`,
        label:
          subFields.length === 1
            ? field.label
            : `${field.label} · ${subFieldLabel}`,
        fieldName: field.name,
        fieldType: field.type,
        subFieldName,
      });
    }
  }

  return definitions;
};
