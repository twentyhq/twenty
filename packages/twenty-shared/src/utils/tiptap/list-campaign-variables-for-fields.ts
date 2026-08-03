import { FieldMetadataType } from '@/types';

export type CampaignVariableDefinition = {
  // The placeholder path as written between braces, e.g. "city" or
  // "name.firstName".
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
  [FieldMetadataType.EMAILS]: [
    { subFieldName: 'primaryEmail', subFieldLabel: 'Email' },
  ],
  [FieldMetadataType.PHONES]: [
    { subFieldName: 'primaryPhoneNumber', subFieldLabel: 'Phone' },
  ],
  [FieldMetadataType.LINKS]: [
    { subFieldName: 'primaryLinkUrl', subFieldLabel: 'URL' },
  ],
};

// Derives the campaign variables a list of person fields exposes. Shared so
// the composer picker, the AI tool and the server-side resolver agree on
// which fields are personalizable and under which paths.
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
        // A composite exposing one path reads best under the field's own
        // label ("Emails"); one exposing several needs the subfield spelled
        // out ("Name · First name").
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
