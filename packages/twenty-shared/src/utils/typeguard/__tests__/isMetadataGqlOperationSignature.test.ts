import { isMetadataGqlOperationSignature } from '../isMetadataGqlOperationSignature';

describe('isMetadataGqlOperationSignature', () => {
  it('should return true when operation signature contains metadataName', () => {
    const signature = {
      metadataName: 'testMetadata',
      variables: {},
    };
    expect(isMetadataGqlOperationSignature(signature)).toBe(true);
  });

  it('should return false when operation signature does not contain metadataName', () => {
    const signature = {
      objectNameSingular: 'company',
      variables: {},
    };
    expect(isMetadataGqlOperationSignature(signature)).toBe(false);
  });
});
