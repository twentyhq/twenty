import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { INVALID_PHONES_TEST_CASES } from 'test/integration/utils/invalid-phones-test-cases';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

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
