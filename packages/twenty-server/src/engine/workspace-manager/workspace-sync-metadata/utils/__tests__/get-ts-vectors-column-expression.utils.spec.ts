import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

const nameTextField = { name: 'name', type: FieldMetadataType.TEXT };
const nameFullNameField = {
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
};
const jobTitleTextField = { name: 'jobTitle', type: FieldMetadataType.TEXT };
const emailsEmailsField = { name: 'emails', type: FieldMetadataType.EMAILS };

jest.mock(
  'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util',
  () => ({
    computeColumnName: jest.fn((name) => {
      if (name === 'name') {
        return 'name';
      }
      if (name === 'jobTitle') {
        return 'jobTitle';
      }
      if (name === 'emailsPrimaryEmail') {
        return 'emailsPrimaryEmail';
      }
      if (name === 'emailsAdditionalEmails') {
        return 'emailsAdditionalEmails';
      }
      if (name === 'nameFirstName') {
        return 'nameFirstName';
      }
      if (name === 'nameLastName') {
        return 'nameLastName';
      }
    }),
    computeCompositeColumnName: jest.fn((field, property) => {
      if (
        field.name === emailsEmailsField.name &&
        property.name === 'primaryEmail'
      ) {
        return 'emailsPrimaryEmail';
      }
      if (
        field.name === emailsEmailsField.name &&
        property.name === 'additionalEmails'
      ) {
        return 'emailsAdditionalEmails';
      }
      if (
        field.name === nameFullNameField.name &&
        property.name === 'firstName'
      ) {
        return 'nameFirstName';
      }
      if (
        field.name === nameFullNameField.name &&
        property.name === 'lastName'
      ) {
        return 'nameLastName';
      }
    }),
  }),
);

describe('getTsVectorColumnExpressionFromFields', () => {
  it('should generate correct expression for simple text field', () => {
    const fields = [nameTextField];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain("to_tsvector('simple', COALESCE(\"name\", ''))");
  });

  it('should handle multiple fields', () => {
    const fields = [nameFullNameField, jobTitleTextField, emailsEmailsField];
    const result = getTsVectorColumnExpressionFromFields(fields);
    const expected = `
    CASE 
      WHEN "deletedAt" IS NULL THEN 
        to_tsvector('simple', COALESCE("nameFirstName", '') || ' ' || COALESCE("nameLastName", '') || ' ' || COALESCE("jobTitle", '') || ' ' || 
      COALESCE(
        replace(
          "emailsPrimaryEmail",
          '@',
          ' '
        ),
        ''
      )
    )
      ELSE NULL
    END
  `.trim();

    expect(result.trim()).toBe(expected);
  });

  it('should include CASE statement for handling deletedAt', () => {
    const fields = [nameTextField];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('CASE');
    expect(result).toContain('WHEN "deletedAt" IS NULL THEN');
    expect(result).toContain('ELSE NULL');
  });
});
