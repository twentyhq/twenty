import { FieldMetadataType } from 'twenty-shared/types';

import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const nameTextField = { name: 'name', type: FieldMetadataType.TEXT };
const nameFullNameField = {
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
};
const jobTitleTextField = { name: 'jobTitle', type: FieldMetadataType.TEXT };
const emailsEmailsField = { name: 'emails', type: FieldMetadataType.EMAILS };
const phonesPhonesField = { name: 'phones', type: FieldMetadataType.PHONES };
const linksLinksField = { name: 'domainName', type: FieldMetadataType.LINKS };

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

  it('should properly index phone subfields including additional phones', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('phonesPrimaryPhoneNumber');
    expect(result).toContain('phonesPrimaryPhoneCallingCode');

    expect(result).toContain('phonesAdditionalPhones');
    expect(result).toContain(
      "COALESCE(TRANSLATE(regexp_replace(\"phonesAdditionalPhones\"::text, '\"(number|countryCode|callingCode)\"\\s*:\\s*', '', 'g'), '[]{}\",:',",
    );
  });

  it('should strip additional phone key names before indexing', () => {
    const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      "regexp_replace(\"phonesAdditionalPhones\"::text, '\"(number|countryCode|callingCode)\"\\s*:\\s*', '', 'g')",
    );
  });

  it('should include additional emails in search expression', () => {
    const fields = [emailsEmailsField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('emailsPrimaryEmail');
    expect(result).toContain('emailsAdditionalEmails');
    expect(result).toContain(
      "COALESCE(public.unaccent_immutable(TRANSLATE(\"emailsAdditionalEmails\"::text, '[]\",', '    ')), '')",
    );
    expect(result).toContain(
      "COALESCE(public.unaccent_immutable(TRANSLATE(REPLACE(\"emailsAdditionalEmails\"::text, '@', ' '), '[]\",', '    ')), '')",
    );
  });

  it('should include secondary links in search expression for LINKS type', () => {
    const fields = [linksLinksField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain('domainNamePrimaryLinkLabel');
    expect(result).toContain('domainNamePrimaryLinkUrl');
    expect(result).toContain('domainNameSecondaryLinks');
    expect(result).toContain(
      "COALESCE(public.unaccent_immutable(TRANSLATE(regexp_replace(\"domainNameSecondaryLinks\"::text, '\"(label|url)\"\\s*:\\s*', '', 'g'), '[]{}\",:',",
    );
  });

  it('should strip secondary link key names before indexing', () => {
    const fields = [linksLinksField] as FieldTypeAndNameMetadata[];
    const result = getTsVectorColumnExpressionFromFields(fields);

    expect(result).toContain(
      "regexp_replace(\"domainNameSecondaryLinks\"::text, '\"(label|url)\"\\s*:\\s*', '', 'g')",
    );
  });

  describe('NULL/empty JSON column handling', () => {
    it('should wrap additionalEmails JSON column with COALESCE for NULL safety', () => {
      const fields = [emailsEmailsField] as FieldTypeAndNameMetadata[];
      const result = getTsVectorColumnExpressionFromFields(fields);

      expect(result).toContain(
        'COALESCE(public.unaccent_immutable(TRANSLATE("emailsAdditionalEmails"::text',
      );
      expect(result).toMatch(
        /COALESCE\(public\.unaccent_immutable\(TRANSLATE\("emailsAdditionalEmails"::text.*\), ''\)/,
      );
    });

    it('should wrap additionalPhones JSON column with COALESCE for NULL safety', () => {
      const fields = [phonesPhonesField] as FieldTypeAndNameMetadata[];
      const result = getTsVectorColumnExpressionFromFields(fields);

      expect(result).toContain(
        'COALESCE(TRANSLATE(regexp_replace("phonesAdditionalPhones"::text',
      );
      expect(result).toMatch(
        /COALESCE\(TRANSLATE\(regexp_replace\("phonesAdditionalPhones"::text.*\), ''\)/,
      );
    });

    it('should wrap secondaryLinks JSON column with COALESCE for NULL safety', () => {
      const fields = [linksLinksField] as FieldTypeAndNameMetadata[];
      const result = getTsVectorColumnExpressionFromFields(fields);

      expect(result).toContain(
        'COALESCE(public.unaccent_immutable(TRANSLATE(regexp_replace("domainNameSecondaryLinks"::text',
      );
      expect(result).toMatch(
        /COALESCE\(public\.unaccent_immutable\(TRANSLATE\(regexp_replace\("domainNameSecondaryLinks"::text.*\), ''\)/,
      );
    });

    it('should use empty string fallback for all JSON array columns', () => {
      const fields = [
        emailsEmailsField,
        phonesPhonesField,
        linksLinksField,
      ] as FieldTypeAndNameMetadata[];
      const result = getTsVectorColumnExpressionFromFields(fields);

      const additionalEmailsCoalesce = result.includes(
        "COALESCE(public.unaccent_immutable(TRANSLATE(\"emailsAdditionalEmails\"::text, '[]\",', '    ')), '')",
      );
      const additionalPhonesCoalesce = result.includes(
        "COALESCE(TRANSLATE(regexp_replace(\"phonesAdditionalPhones\"::text, '\"(number|countryCode|callingCode)\"\\s*:\\s*', '', 'g'), '[]{}\",:',",
      );
      const secondaryLinksCoalesce = result.includes(
        "COALESCE(public.unaccent_immutable(TRANSLATE(regexp_replace(\"domainNameSecondaryLinks\"::text, '\"(label|url)\"\\s*:\\s*', '', 'g'), '[]{}\",:',",
      );

      expect(additionalEmailsCoalesce).toBe(true);
      expect(additionalPhonesCoalesce).toBe(true);
      expect(secondaryLinksCoalesce).toBe(true);
    });
  });
});
