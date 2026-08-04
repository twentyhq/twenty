import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

import { RecordTransformerExceptionCode } from 'src/engine/core-modules/record-transformer/record-transformer.exception';

const INVALID_PHONES_TEST_CASES = [
  {
    label: 'invalid phone number format',
    phones: { primaryPhoneNumber: 'not-a-number' },
    expectedSubCode: RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
    expectedMessage: 'Provided phone number is invalid not-a-number',
  },
  {
    label: 'invalid country code',
    phones: {
      primaryPhoneNumber: '123456789',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'XX',
    },
    expectedSubCode: RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE,
    expectedMessage: 'Invalid country code XX',
  },
  {
    label: 'invalid calling code',
    phones: {
      primaryPhoneNumber: '123456789',
      primaryPhoneCallingCode: '+999',
      primaryPhoneCountryCode: 'FR',
    },
    expectedSubCode: RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE,
    expectedMessage: 'Invalid calling code +999',
  },
  {
    label: 'conflicting country code and calling code',
    phones: {
      primaryPhoneNumber: '123456789',
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'US',
    },
    expectedSubCode:
      RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE,
    expectedMessage: 'Provided country code and calling code are conflicting',
  },
  {
    label: 'phone number conflicting with provided country code',
    phones: {
      primaryPhoneNumber: '+33123456789',
      primaryPhoneCountryCode: 'US',
    },
    expectedSubCode:
      RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE,
    expectedMessage: 'Provided and inferred country code are conflicting',
  },
  {
    label: 'phone number conflicting with provided calling code',
    phones: {
      primaryPhoneNumber: '+33123456789',
      primaryPhoneCallingCode: '+1',
    },
    expectedSubCode:
      RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE,
    expectedMessage: 'Provided and inferred calling code are conflicting',
  },
  {
    label: 'invalid phone number format inside additionalPhones',
    phones: {
      primaryPhoneNumber: '',
      additionalPhones: [{ number: 'not-a-number' }],
    },
    expectedSubCode: RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
    expectedMessage: 'Provided phone number is invalid not-a-number',
  },
];

describe('people phones field create validation (integration)', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  afterAll(async () => {
    await deleteAllRecords('person');
  });

  it.each(INVALID_PHONES_TEST_CASES)(
    'should fail to create a person with $label',
    async ({ phones, expectedSubCode, expectedMessage }) => {
      const { data, errors } = await createOneOperation({
        objectMetadataSingularName: 'person',
        input: { phones },
        gqlFields: 'id',
      });

      expect(data.createOneResponse).toBeNull();
      expect(errors).toEqual([
        expect.objectContaining({
          message: expectedMessage,
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            subCode: expectedSubCode,
          }),
        }),
      ]);
    },
  );

  it('should create a person when the primary phone number is valid', async () => {
    const { data, errors } = await createOneOperation({
      objectMetadataSingularName: 'person',
      input: {
        phones: {
          primaryPhoneNumber: '4155552671',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
        },
      },
      gqlFields: 'id',
    });

    expect(errors).toBeUndefined();
    expect(data.createOneResponse.id).toBeDefined();
  });
});
