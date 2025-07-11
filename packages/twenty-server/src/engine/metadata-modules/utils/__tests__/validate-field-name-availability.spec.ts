import { EachTestingContext } from 'twenty-shared/testing';

import {
  FIELD_ACTOR_MOCK_NAME,
  FIELD_ADDRESS_MOCK_NAME,
  FIELD_CURRENCY_MOCK_NAME,
  FIELD_FULL_NAME_MOCK_NAME,
  FIELD_LINKS_MOCK_NAME,
  objectMetadataMapItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';

type ValidateFieldNameAvailabilityTestContext = EachTestingContext<{
  input: string;
  shouldNotThrow?: true;
}>;

const validateFieldNameAvailabilityTestCases: ValidateFieldNameAvailabilityTestContext[] =
  [
    {
      title: 'does not throw if name is not reserved',
      context: {
        input: 'testName',
        shouldNotThrow: true,
      },
    },
    {
      title: 'throws error with LINKS suffixes',
      context: {
        input: `${FIELD_LINKS_MOCK_NAME}PrimaryLinkLabel`,
      },
    },
    {
      title: 'throws error with CURRENCY suffixes',
      context: {
        input: `${FIELD_CURRENCY_MOCK_NAME}AmountMicros`,
      },
    },
    {
      title: 'throws error with FULL_NAME suffixes',
      context: {
        input: `${FIELD_FULL_NAME_MOCK_NAME}FirstName`,
      },
    },
    {
      title: 'throws error with ACTOR suffixes',
      context: {
        input: `${FIELD_ACTOR_MOCK_NAME}Name`,
      },
    },
    {
      title: 'throws error with ADDRESS suffixes',
      context: {
        input: `${FIELD_ADDRESS_MOCK_NAME}AddressStreet1`,
      },
    },
  ];

describe('validateFieldNameAvailabilityOrThrow', () => {
  it.each(validateFieldNameAvailabilityTestCases)(
    '$title',
    ({ context: { input, shouldNotThrow } }) => {
      if (shouldNotThrow) {
        expect(() =>
          validateFieldNameAvailabilityOrThrow({
            name: input,
            objectMetadata: objectMetadataMapItemMock,
          }),
        ).not.toThrow();
      } else {
        expect(() =>
          validateFieldNameAvailabilityOrThrow({
            name: input,
            objectMetadata: objectMetadataMapItemMock,
          }),
        ).toThrowErrorMatchingSnapshot();
      }
    },
  );
});
