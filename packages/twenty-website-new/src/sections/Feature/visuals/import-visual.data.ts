export type FieldMapping = {
  csvColumn: string;
  crmField: string;
  mapped: boolean;
};

export const FIELD_MAPPINGS: FieldMapping[] = [
  { crmField: 'Full Name', csvColumn: 'name', mapped: true },
  { crmField: 'Email', csvColumn: 'email_address', mapped: true },
  { crmField: 'Company', csvColumn: 'organization', mapped: true },
  { crmField: 'Phone', csvColumn: 'phone_number', mapped: true },
  { crmField: 'City', csvColumn: 'city', mapped: false },
  { crmField: 'Job Title', csvColumn: 'title', mapped: false },
];
