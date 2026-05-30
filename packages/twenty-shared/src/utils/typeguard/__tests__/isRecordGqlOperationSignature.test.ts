import { isRecordGqlOperationSignature } from '../isRecordGqlOperationSignature';

describe('isRecordGqlOperationSignature', () => {
  it('should return true when operation signature contains objectNameSingular', () => {
    const signature = {
      objectNameSingular: 'company',
      variables: {},
    };
    expect(isRecordGqlOperationSignature(signature)).toBe(true);
  });

  it('should return false when operation signature does not contain objectNameSingular', () => {
    const signature = {
      metadataName: 'testMetadata',
      variables: {},
    };
    expect(isRecordGqlOperationSignature(signature)).toBe(false);
  });
});
