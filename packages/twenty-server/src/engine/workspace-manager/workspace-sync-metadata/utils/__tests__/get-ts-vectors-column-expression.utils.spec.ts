import { FieldMetadataType } from 'twenty-shared/types';

import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

const nameTextField = { name: 'name', type: FieldMetadataType.TEXT };
const nameFullNameField = {
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
};
const jobTitleTextField = { name: 'jobTitle', type: FieldMetadataType.TEXT };
const emailsEmailsField = { name: 'emails', type: FieldMetadataType.EMAILS };
const phonesPhonesField = { name: 'phones', type: FieldMetadataType.PHONES };

describe('getTsVectorColumnExpressionFromFields', () => {
  it('should generate correct expression for simple text field', () => {
    const fields = [nameTextField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      "to_tsvector('simple', COALESCE(public.unaccent_immutable(\"name\"), ''))",
    );
  });

  it('should handle multiple fields', () => {
    const fields = [
      nameFullNameField,
      jobTitleTextField,
      emailsEmailsField,
    ] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      'COALESCE(public.unaccent_immutable("nameFirstName"), \'\')',
    );
    expect(result).toContain(
      'COALESCE(public.unaccent_immutable("nameLastName"), \'\')',
    );
    expect(result).toContain(
      'COALESCE(public.unaccent_immutable("jobTitle"), \'\')',
    );
    expect(result).toContain(
      'COALESCE(public.unaccent_immutable("emailsPrimaryEmail"), \'\')',
    );
    expect(result).toContain(
      "COALESCE(public.unaccent_immutable(SPLIT_PART(\"emailsPrimaryEmail\", '@', 2)), '')",
    );
  });

  it('should handle rich text fields', () => {
    const fields = [
      { name: 'body', type: FieldMetadataType.RICH_TEXT },
    ] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toBe(
      "to_tsvector('simple', COALESCE(public.unaccent_immutable(\"body\"), ''))",
    );
  });

  it('should handle rich text v2 fields', () => {
    const fields = [
      { name: 'bodyV2', type: FieldMetadataType.RICH_TEXT_V2 },
    ] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toBe(
      "to_tsvector('simple', COALESCE(public.unaccent_immutable(\"bodyV2Markdown\"), ''))",
    );
  });

  it('should handle phone fields without unaccenting', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('COALESCE("phonesPrimaryPhoneNumber", \'\')');
    expect(result).toContain('COALESCE("phonesPrimaryPhoneCallingCode", \'\')');
    expect(result).not.toContain('unaccent_immutable');
  });

  it('should generate international format expressions for phone fields', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      'COALESCE("phonesPrimaryPhoneCallingCode" || "phonesPrimaryPhoneNumber", \'\')',
    );
    expect(result).toContain(
      "COALESCE(REPLACE(\"phonesPrimaryPhoneCallingCode\", '+', '') || \"phonesPrimaryPhoneNumber\", '')",
    );
  });

  it('should generate trunk prefix format expression for phone fields', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      "COALESCE('0' || \"phonesPrimaryPhoneNumber\", '')",
    );
  });

  it('should properly index phone subfields', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('phonesPrimaryPhoneNumber');
    expect(result).toContain('phonesPrimaryPhoneCallingCode');
    expect(result).not.toContain('phonesAdditionalPhones');
  });
});
