import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

const createdByFieldsNames = [
  'createdByName',
  'createdByWorkspaceMemberId',
  'createdBySource',
];

const linkedinLinkFieldsNames = [
  'linkedinLinkPrimaryLinkLabel',
  'linkedinLinkPrimaryLinkUrl',
  'linkedinLinkPrimaryLinkLabel',
];

const xLinkFieldsNames = [
  'xLinkPrimaryLinkLabel',
  'xLinkPrimaryLinkUrl',
  'xLinkSecondaryLinks',
];

const amountFieldsNames = [
  'annualRecurringRevenueAmountMicros',
  'annualRecurringRevenueCurrencyCode',
];

const reservedCompositeFieldsNamesForPerson = [
  ...createdByFieldsNames,
  ...linkedinLinkFieldsNames,
  ...xLinkFieldsNames,
  'nameFirstName',
  'nameLastName',
];
const reservedCompositeFieldsNamesForCompany = [
  ...createdByFieldsNames,
  ...linkedinLinkFieldsNames,
  ...xLinkFieldsNames,
  ...amountFieldsNames,
  'domainNamePrimaryLinkLabel',
  'domainNamePrimaryLinkUrl',
  'domainNameSecondaryLinks',
  'addressAddressStreet1',
  'addressAddressStreet2',
  'addressAddressCity',
  'addressAddressState',
  'addressAddressPostcode',
  'addressAddressCountry',
  'addressAddressLat',
  'addressAddressLng',
  'introVideoPrimaryLinkLabel',
  'introVideoPrimaryLinkUrl',
  'introVideoSecondaryLinks',
];
const reservedCompositeFieldsNamesForOpportunity = [
  ...createdByFieldsNames,
  ...amountFieldsNames,
];

const getReservedCompositeFieldsNames = (
  objectMetadataStandardId: string | null,
) => {
  switch (objectMetadataStandardId) {
    case STANDARD_OBJECT_IDS.person:
      return reservedCompositeFieldsNamesForPerson;
    case STANDARD_OBJECT_IDS.company:
      return reservedCompositeFieldsNamesForCompany;
    case STANDARD_OBJECT_IDS.opportunity:
      return reservedCompositeFieldsNamesForOpportunity;
    default:
      return createdByFieldsNames;
  }
};

export const validateNameAvailabilityOrThrow = (
  name: string,
  objectMetadataStandardId: string | null,
) => {
  const reservedCompositeFieldsNames = getReservedCompositeFieldsNames(
    objectMetadataStandardId,
  );

  if (reservedCompositeFieldsNames.includes(name)) {
    throw new NameNotAvailableException(name);
  }
};

export class NameNotAvailableException extends Error {
  constructor(name: string) {
    const message = `Name "${name}" is not available`;

    super(message);
  }
}
