import {
  NameNotAvailableException,
  validateNameAvailabilityOrThrow,
} from 'src/engine/metadata-modules/utils/validate-name-availability.utils';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

describe('validateNameAvailabilityOrThrow', () => {
  describe('on person', () => {
    const objectMetadataStandardId = STANDARD_OBJECT_IDS.person;

    it('does not throw if name is not reserved', () => {
      const name = 'testName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).not.toThrow();
    });
    it('throws error if name is reserved', () => {
      const name = 'nameFirstName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).toThrow(NameNotAvailableException);
    });
  });
  describe('on company', () => {
    const objectMetadataStandardId = STANDARD_OBJECT_IDS.company;

    it('does not throw if name is not reserved', () => {
      const name = 'nameFirstName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).not.toThrow();
    });
    it('throws error if name is reserved', () => {
      const name = 'domainNamePrimaryLinkUrl';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).toThrow(NameNotAvailableException);
    });
  });
  describe('on opportunity', () => {
    const objectMetadataStandardId = STANDARD_OBJECT_IDS.opportunity;

    it('does not throw if name is not reserved', () => {
      const name = 'nameFirstName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).not.toThrow();
    });
    it('throws error if name is reserved', () => {
      const name = 'annualRecurringRevenueAmountMicros';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).toThrow(NameNotAvailableException);
    });
  });
  describe('on custom object', () => {
    const objectMetadataStandardId = null;

    it('does not throw if name is not reserved', () => {
      const name = 'nameFirstName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).not.toThrow();
    });
    it('throws error if name is reserved', () => {
      const name = 'createdByName';

      expect(() =>
        validateNameAvailabilityOrThrow(name, objectMetadataStandardId),
      ).toThrow(NameNotAvailableException);
    });
  });
});
