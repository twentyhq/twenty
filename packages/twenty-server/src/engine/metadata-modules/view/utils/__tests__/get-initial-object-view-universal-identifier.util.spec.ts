import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { getSystemViewUniversalIdentifier } from 'twenty-shared/application';

describe('getInitialObjectViewUniversalIdentifier', () => {
  const viewApplicationUniversalIdentifier =
    '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const objectUniversalIdentifier = '20202020-b374-4779-a561-80086cb2e17f';

  it('should be stable for the same object', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).toBe(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    );
  });

  it('should differ from the INDEX view identifier of the same object', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).not.toBe(
      getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          viewApplicationUniversalIdentifier,
        objectUniversalIdentifier,
        viewKey: 'INDEX',
      }),
    );
  });

  it('should differ across objects', () => {
    expect(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    ).not.toBe(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier,
        objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
      }),
    );
  });
});
