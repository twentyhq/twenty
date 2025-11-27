import { FieldMetadataType } from 'twenty-shared/types';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { findDefaultNullEquivalentValue } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/find-default-null-equivalent-value.util';

describe('findDefaultNullEquivalentValue', () => {
  describe('Simple Types', () => {
    describe('TEXT', () => {
      it('should return DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for null', () => {
        expect(
          findDefaultNullEquivalentValue({
            value: null,
            fieldMetadataType: FieldMetadataType.TEXT,
          }),
        ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for empty string', () => {
        expect(
          findDefaultNullEquivalentValue({
            value: '',
            fieldMetadataType: FieldMetadataType.TEXT,
          }),
        ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return undefined for non-null equivalent value', () => {
        expect(
          findDefaultNullEquivalentValue({
            value: 'value',
            fieldMetadataType: FieldMetadataType.TEXT,
          }),
        ).toBeUndefined();
      });
    });

    describe('ARRAY', () => {
      it('should return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for null', () => {
        expect(
          findDefaultNullEquivalentValue({
            value: null,
            fieldMetadataType: FieldMetadataType.ARRAY,
          }),
        ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for empty array', () => {
        expect(
          findDefaultNullEquivalentValue({
            value: [],
            fieldMetadataType: FieldMetadataType.ARRAY,
          }),
        ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });
    });
  });

  describe('ACTOR', () => {
    it('should return text default for name', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.ACTOR,
          key: 'name',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return undefined for context', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: {},
          fieldMetadataType: FieldMetadataType.ACTOR,
          key: 'context',
        }),
      ).toBe(undefined);
    });
  });

  describe('ADDRESS', () => {
    it.each([
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressPostcode',
      'addressCountry',
    ])('should return text default for %s', (key) => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.ADDRESS,
          key,
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('EMAILS', () => {
    it('should return text default for primaryEmail', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.EMAILS,
          key: 'primaryEmail',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return array default for additionalEmails', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: [],
          fieldMetadataType: FieldMetadataType.EMAILS,
          key: 'additionalEmails',
        }),
      ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('LINKS', () => {
    it('should return text default for primaryLinkUrl', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.LINKS,
          key: 'primaryLinkUrl',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryLinkLabel', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.LINKS,
          key: 'primaryLinkLabel',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('PHONES', () => {
    it('should return text default for primaryPhoneNumber', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.PHONES,
          key: 'primaryPhoneNumber',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryPhoneCountryCode', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.PHONES,
          key: 'primaryPhoneCountryCode',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryPhoneCallingCode', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.PHONES,
          key: 'primaryPhoneCallingCode',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('RICH_TEXT_V2', () => {
    it('should return undefined for blocknote', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: {},
          fieldMetadataType: FieldMetadataType.RICH_TEXT_V2,
          key: 'blocknote',
        }),
      ).toBe(undefined);
    });

    it('should return text default for markdown', () => {
      expect(
        findDefaultNullEquivalentValue({
          value: '',
          fieldMetadataType: FieldMetadataType.RICH_TEXT_V2,
          key: 'markdown',
        }),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('FULL_NAME', () => {
    it.each(['firstName', 'lastName'])(
      'should return text default for %s',
      (key) => {
        expect(
          findDefaultNullEquivalentValue({
            value: '',
            fieldMetadataType: FieldMetadataType.FULL_NAME,
            key,
          }),
        ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      },
    );
  });
});

it('should return undefined for unknown type', () => {
  expect(
    findDefaultNullEquivalentValue({
      value: null,
      fieldMetadataType: 'UNKNOWN' as any,
    }),
  ).toBeUndefined();
});

it('should return undefined for unknown composite key', () => {
  expect(
    findDefaultNullEquivalentValue({
      value: '',
      fieldMetadataType: FieldMetadataType.ACTOR,
      key: 'unknown',
    }),
  ).toBeUndefined();
});
