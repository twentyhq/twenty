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
          findDefaultNullEquivalentValue(null, FieldMetadataType.TEXT),
        ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE for empty string', () => {
        expect(findDefaultNullEquivalentValue('', FieldMetadataType.TEXT)).toBe(
          DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
        );
      });

      it('should return undefined for non-null equivalent value', () => {
        expect(
          findDefaultNullEquivalentValue('value', FieldMetadataType.TEXT),
        ).toBeUndefined();
      });
    });

    describe('ARRAY', () => {
      it('should return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for null', () => {
        expect(
          findDefaultNullEquivalentValue(null, FieldMetadataType.ARRAY),
        ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });

      it('should return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE for empty array', () => {
        expect(
          findDefaultNullEquivalentValue([], FieldMetadataType.ARRAY),
        ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
      });
    });
  });

  describe('ACTOR', () => {
    it('should return text default for name', () => {
      expect(
        findDefaultNullEquivalentValue('', FieldMetadataType.ACTOR, 'name'),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return undefined for context', () => {
      expect(
        findDefaultNullEquivalentValue({}, FieldMetadataType.ACTOR, 'context'),
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
        findDefaultNullEquivalentValue('', FieldMetadataType.ADDRESS, key),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('EMAILS', () => {
    it('should return text default for primaryEmail', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.EMAILS,
          'primaryEmail',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return array default for additionalEmails', () => {
      expect(
        findDefaultNullEquivalentValue(
          [],
          FieldMetadataType.EMAILS,
          'additionalEmails',
        ),
      ).toBe(DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('LINKS', () => {
    it('should return text default for primaryLinkUrl', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.LINKS,
          'primaryLinkUrl',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryLinkLabel', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.LINKS,
          'primaryLinkLabel',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('PHONES', () => {
    it('should return text default for primaryPhoneNumber', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.PHONES,
          'primaryPhoneNumber',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryPhoneCountryCode', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.PHONES,
          'primaryPhoneCountryCode',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });

    it('should return text default for primaryPhoneCallingCode', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.PHONES,
          'primaryPhoneCallingCode',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('RICH_TEXT_V2', () => {
    it('should return undefined for blocknote', () => {
      expect(
        findDefaultNullEquivalentValue(
          {},
          FieldMetadataType.RICH_TEXT_V2,
          'blocknote',
        ),
      ).toBe(undefined);
    });

    it('should return text default for markdown', () => {
      expect(
        findDefaultNullEquivalentValue(
          '',
          FieldMetadataType.RICH_TEXT_V2,
          'markdown',
        ),
      ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
    });
  });

  describe('FULL_NAME', () => {
    it.each(['firstName', 'lastName'])(
      'should return text default for %s',
      (key) => {
        expect(
          findDefaultNullEquivalentValue('', FieldMetadataType.FULL_NAME, key),
        ).toBe(DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE);
      },
    );
  });
});

it('should return undefined for unknown type', () => {
  expect(
    findDefaultNullEquivalentValue(null, 'UNKNOWN' as any),
  ).toBeUndefined();
});

it('should return undefined for unknown composite key', () => {
  expect(
    findDefaultNullEquivalentValue('', FieldMetadataType.ACTOR, 'unknown'),
  ).toBeUndefined();
});
