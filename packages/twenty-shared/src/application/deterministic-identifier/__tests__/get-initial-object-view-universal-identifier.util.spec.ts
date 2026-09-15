import { getInitialObjectViewUniversalIdentifier } from '@/application/deterministic-identifier/get-initial-object-view-universal-identifier.util';
import { getSystemViewUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-universal-identifier.util';

describe('getInitialObjectViewUniversalIdentifier', () => {
  const objectMetadataApplicationUniversalIdentifier =
    '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const objectUniversalIdentifier = '20202020-b374-4779-a561-80086cb2e17f';

  it('should be stable for the same object', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).toBe(
      getInitialObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    );
  });

  it('should differ from the INDEX view identifier of the same object', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).not.toBe(
      getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
        viewKey: 'INDEX',
      }),
    );
  });

  it('should differ across objects', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).not.toBe(
      getInitialObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
      }),
    );
  });
});
